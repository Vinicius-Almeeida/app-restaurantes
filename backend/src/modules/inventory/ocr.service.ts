import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import * as pdf from 'pdf-parse';
import fs from 'fs/promises';

interface ExtractedProduct {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
}

interface OCRResult {
  rawText: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  totalAmount?: number;
  products: ExtractedProduct[];
}

export class OCRService {
  /**
   * Processa imagem ou PDF e extrai texto usando OCR
   */
  async processFile(filePath: string, fileType: string): Promise<OCRResult> {
    let rawText = '';

    try {
      if (fileType === 'pdf') {
        rawText = await this.processPDF(filePath);
      } else {
        // JPEG, PNG - processa como imagem
        rawText = await this.processImage(filePath);
      }

      // Extrai informações estruturadas do texto bruto
      const result = this.parseInvoiceText(rawText);

      return result;
    } catch (error) {
      console.error('Erro no processamento OCR:', error);
      throw new Error(`Falha no processamento OCR: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Processa imagem usando Tesseract
   */
  private async processImage(filePath: string): Promise<string> {
    try {
      // Pré-processar imagem para melhorar OCR
      const processedImagePath = await this.preprocessImage(filePath);

      // Executar OCR
      const { data } = await Tesseract.recognize(
        processedImagePath,
        'por', // Português
        {
          logger: (info) => {
            if (info.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
            }
          },
        }
      );

      // Limpar arquivo temporário
      if (processedImagePath !== filePath) {
        await fs.unlink(processedImagePath);
      }

      return data.text;
    } catch (error) {
      throw new Error(`Erro ao processar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Pré-processa imagem para melhorar qualidade do OCR
   */
  private async preprocessImage(filePath: string): Promise<string> {
    try {
      const processedPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '_processed.png');

      await sharp(filePath)
        .greyscale() // Converter para escala de cinza
        .normalize() // Normalizar contraste
        .sharpen() // Aumentar nitidez
        .toFile(processedPath);

      return processedPath;
    } catch (error) {
      console.warn('Falha no pré-processamento, usando imagem original:', error);
      return filePath;
    }
  }

  /**
   * Processa PDF e extrai texto
   */
  private async processPDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      // @ts-ignore - pdf-parse tem problemas de tipos
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`Erro ao processar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Analisa o texto extraído e identifica produtos, valores, etc.
   * Esta é uma implementação básica que pode ser melhorada com IA/ML
   */
  private parseInvoiceText(text: string): OCRResult {
    const result: OCRResult = {
      rawText: text,
      products: [],
    };

    // Extrair número da nota fiscal
    const invoiceNumberMatch = text.match(/(?:nota|nf|n[°º]|numero)[\s:]*(\d+)/i);
    if (invoiceNumberMatch) {
      result.invoiceNumber = invoiceNumberMatch[1];
    }

    // Extrair data (formatos: DD/MM/YYYY, DD-MM-YYYY)
    const dateMatch = text.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if (dateMatch) {
      result.invoiceDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`; // Formato ISO
    }

    // Extrair total (busca por "total", "valor total", etc)
    const totalMatch = text.match(/(?:total|valor\s+total|total\s+geral)[\s:R$]*(\d+[\.,]\d{2})/i);
    if (totalMatch) {
      result.totalAmount = parseFloat(totalMatch[1].replace(',', '.'));
    }

    // Extrair produtos - padrão básico:
    // Linha contendo: quantidade, nome do produto, preço unitário, preço total
    // Exemplo: "5 KG ARROZ 10,00 50,00" ou "10 UN OLEO 8,50 85,00"
    const lines = text.split('\n');

    for (const line of lines) {
      // Padrão: [quantidade] [unidade] [nome do produto] [preço unitário] [preço total]
      const productMatch = line.match(
        /(\d+[\.,]?\d*)\s*(kg|un|l|g|ml|pc|cx|un|unid)?[\s]+([\w\s\-áéíóúàãõâêôç]+?)\s+(\d+[\.,]\d{2})\s+(\d+[\.,]\d{2})/i
      );

      if (productMatch) {
        const [, qty, unit, name, unitPrice, totalPrice] = productMatch;

        result.products.push({
          name: (name || '').trim(),
          quantity: parseFloat((qty || '0').replace(',', '.')),
          unitPrice: parseFloat((unitPrice || '0').replace(',', '.')),
          totalPrice: parseFloat((totalPrice || '0').replace(',', '.')),
          unit: unit?.toUpperCase() || 'UN',
        });
      }
    }

    return result;
  }

  /**
   * Valida se os produtos extraídos fazem sentido
   */
  validateExtractedData(result: OCRResult): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (result.products.length === 0) {
      errors.push('Nenhum produto foi identificado na nota fiscal');
    }

    // Verificar se a soma dos produtos bate com o total
    if (result.totalAmount !== undefined && result.products.length > 0) {
      const calculatedTotal = result.products.reduce((sum, p) => sum + p.totalPrice, 0);
      const difference = Math.abs(calculatedTotal - result.totalAmount);

      // Tolerância de 1% ou R$ 1,00
      if (difference > Math.max(result.totalAmount * 0.01, 1)) {
        errors.push(
          `Divergência nos valores: Total calculado (R$ ${calculatedTotal.toFixed(2)}) ` +
          `difere do total da nota (R$ ${result.totalAmount.toFixed(2)})`
        );
      }
    }

    // Validar cada produto
    result.products.forEach((product, index) => {
      if (!product.name || product.name.length < 2) {
        errors.push(`Produto ${index + 1}: Nome inválido ou muito curto`);
      }
      if (product.quantity <= 0) {
        errors.push(`Produto ${index + 1}: Quantidade inválida`);
      }
      if (product.unitPrice <= 0) {
        errors.push(`Produto ${index + 1}: Preço unitário inválido`);
      }

      // Verificar se o cálculo está correto
      const expectedTotal = product.quantity * product.unitPrice;
      if (Math.abs(expectedTotal - product.totalPrice) > 0.1) {
        errors.push(
          `Produto ${index + 1}: Cálculo incorreto ` +
          `(${product.quantity} x ${product.unitPrice} ≠ ${product.totalPrice})`
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const ocrService = new OCRService();
