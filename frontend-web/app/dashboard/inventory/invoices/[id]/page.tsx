'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { InvoiceUpload, ExtractedProduct } from '@/lib/types/inventory';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceUpload | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [products, setProducts] = useState<ExtractedProduct[]>([]);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/inventory/invoices/${invoiceId}`);
      const invoiceData = (response.data as any).data;
      setInvoice(invoiceData);

      // Se já tem produtos extraídos, carregar
      if (invoiceData.extractedData?.products) {
        setProducts(invoiceData.extractedData.products);
      }
    } catch (error: any) {
      console.error('Erro ao buscar invoice:', error);
      toast.error('Erro ao carregar nota fiscal');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (products.length === 0) {
      toast.error('Nenhum produto para confirmar');
      return;
    }

    setConfirming(true);

    try {
      await api.post(`/inventory/invoices/${invoiceId}/confirm`, {
        items: products.map((p) => ({
          name: p.name,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          unit: p.unit,
          inventoryItemId: p.inventoryItemId,
        })),
      });

      toast.success('Nota fiscal confirmada e estoque atualizado!');
      router.push('/dashboard/inventory');
    } catch (error: any) {
      console.error('Erro ao confirmar invoice:', error);
      toast.error(error.response?.data?.error || 'Erro ao confirmar nota fiscal');
    } finally {
      setConfirming(false);
    }
  };

  const updateProduct = (index: number, field: keyof ExtractedProduct, value: any) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        name: '',
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        unit: 'UN',
      },
    ]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Nota fiscal não encontrada</h2>
          <Button onClick={() => router.back()}>Voltar</Button>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      UPLOADED: { variant: 'secondary', label: 'Enviado' },
      PROCESSING: { variant: 'default', label: 'Processando...' },
      PROCESSED: { variant: 'default', label: 'Processado' },
      ERROR: { variant: 'destructive', label: 'Erro' },
      CANCELLED: { variant: 'secondary', label: 'Cancelado' },
    };
    return variants[status] || variants.UPLOADED;
  };

  const statusInfo = getStatusBadge(invoice.status);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Revisar Nota Fiscal</h1>
          <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
        </div>
        <p className="text-gray-600">
          Revise os dados extraídos e confirme para adicionar ao estoque
        </p>
      </div>

      {/* Info da Invoice */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Informações da Nota</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Arquivo</Label>
            <p className="text-sm">{invoice.fileName}</p>
          </div>
          <div>
            <Label>Número</Label>
            <p className="text-sm">{invoice.invoiceNumber || '-'}</p>
          </div>
          <div>
            <Label>Data</Label>
            <p className="text-sm">
              {invoice.invoiceDate
                ? new Date(invoice.invoiceDate).toLocaleDateString('pt-BR')
                : '-'}
            </p>
          </div>
          <div>
            <Label>Total</Label>
            <p className="text-sm font-bold">
              {invoice.totalAmount
                ? `R$ ${invoice.totalAmount.toFixed(2)}`
                : '-'}
            </p>
          </div>
        </div>
      </Card>

      {/* Status do OCR */}
      {invoice.status === 'PROCESSING' && (
        <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">Processando OCR...</h3>
              <p className="text-sm text-blue-700">
                Aguarde enquanto extraímos os dados da nota fiscal
              </p>
            </div>
          </div>
        </Card>
      )}

      {invoice.status === 'ERROR' && (
        <Card className="p-6 mb-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-medium text-red-900">Erro no processamento</h3>
              <p className="text-sm text-red-700">{invoice.errorMessage}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Avisos de validação */}
      {invoice.extractedData?.validationErrors &&
        invoice.extractedData.validationErrors.length > 0 && (
          <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900 mb-2">
                  Avisos de Validação
                </h3>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  {invoice.extractedData.validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

      {/* Produtos Extraídos */}
      {invoice.status === 'PROCESSED' && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Produtos Identificados</h2>
            <Button onClick={addProduct} variant="outline" size="sm">
              Adicionar Produto
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Produto</th>
                  <th className="text-left p-2">Quantidade</th>
                  <th className="text-left p-2">Unidade</th>
                  <th className="text-left p-2">Preço Unit.</th>
                  <th className="text-left p-2">Total</th>
                  <th className="text-left p-2"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <Input
                        value={product.name}
                        onChange={(e) => updateProduct(index, 'name', e.target.value)}
                        placeholder="Nome do produto"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={product.quantity}
                        onChange={(e) =>
                          updateProduct(index, 'quantity', parseFloat(e.target.value))
                        }
                        className="w-24"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={product.unit}
                        onChange={(e) => updateProduct(index, 'unit', e.target.value)}
                        className="w-20"
                        placeholder="UN"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={product.unitPrice}
                        onChange={(e) =>
                          updateProduct(index, 'unitPrice', parseFloat(e.target.value))
                        }
                        className="w-28"
                      />
                    </td>
                    <td className="p-2">
                      <span className="font-medium">
                        R$ {(product.quantity * product.unitPrice).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td colSpan={4} className="text-right p-2">
                    Total:
                  </td>
                  <td className="p-2">
                    R${' '}
                    {products
                      .reduce((sum, p) => sum + p.quantity * p.unitPrice, 0)
                      .toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* Botões de ação */}
      <div className="flex gap-4">
        <Button
          onClick={handleConfirm}
          disabled={
            confirming ||
            invoice.isConfirmed ||
            products.length === 0 ||
            invoice.status !== 'PROCESSED'
          }
          size="lg"
        >
          {confirming ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Confirmando...
            </>
          ) : invoice.isConfirmed ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Já Confirmado
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar e Adicionar ao Estoque
            </>
          )}
        </Button>

        <Button variant="outline" onClick={() => router.back()} size="lg">
          Voltar
        </Button>
      </div>
    </div>
  );
}
