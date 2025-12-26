'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function UploadInvoicePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (selectedFile: File) => {
    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Tipo de arquivo inválido. Use JPEG, PNG ou PDF.');
      return;
    }

    // Validar tamanho (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 10MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecione um arquivo');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('invoice', file);

      if (supplierId) formData.append('supplierId', supplierId);
      if (invoiceNumber) formData.append('invoiceNumber', invoiceNumber);
      if (invoiceDate) formData.append('invoiceDate', invoiceDate);

      const response = await api.post('/inventory/invoices/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success((response.data as any).message || 'Nota fiscal enviada com sucesso!');

      // Redirecionar para a página de detalhes da invoice
      router.push(`/dashboard/inventory/invoices/${(response.data as any).data.id}`);
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error.response?.data?.error || 'Erro ao fazer upload da nota fiscal');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Upload de Nota Fiscal</h1>
        <p className="text-gray-600 mt-2">
          Faça upload de uma nota fiscal ou pedido para processamento automático com OCR
        </p>
      </div>

      <Card className="p-6">
        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
              <p className="text-lg font-medium mb-2">{file.name}</p>
              <p className="text-sm text-gray-500 mb-4">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <Button
                variant="outline"
                onClick={() => setFile(null)}
              >
                Remover arquivo
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">
                Arraste e solte a nota fiscal aqui
              </p>
              <p className="text-sm text-gray-500 mb-4">
                ou clique para selecionar um arquivo
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Selecionar arquivo
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Formatos aceitos: JPEG, PNG, PDF (máx. 10MB)
              </p>
            </div>
          )}
        </div>

        {/* Metadados opcionais */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Número da Nota (opcional)</Label>
              <Input
                id="invoiceNumber"
                placeholder="Ex: 12345"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="invoiceDate">Data da Nota (opcional)</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
          </div>

          {/* TODO: Add supplier select dropdown */}
          {/* <div>
            <Label htmlFor="supplierId">Fornecedor (opcional)</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              ...
            </Select>
          </div> */}
        </div>

        {/* Botões de ação */}
        <div className="mt-6 flex gap-4">
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Fazer Upload e Processar
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={uploading}
          >
            Cancelar
          </Button>
        </div>

        {/* Info sobre OCR */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">
            Como funciona o processamento automático:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>O sistema usa OCR para extrair texto da nota fiscal</li>
            <li>Identifica automaticamente produtos, quantidades e preços</li>
            <li>Você poderá revisar e confirmar os dados antes de adicionar ao estoque</li>
            <li>O processamento pode levar alguns segundos</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
