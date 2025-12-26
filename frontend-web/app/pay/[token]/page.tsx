'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { LoadingScreen } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface PaymentData {
  id: string;
  amount: number;
  status: string;
  token: string;
  order: {
    id: string;
    tableNumber: number;
    restaurant: {
      name: string;
    };
  };
  user: {
    fullName: string;
    email: string;
  };
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    fetchPaymentData();
  }, [token]);

  const fetchPaymentData = async () => {
    try {
      const response = await apiClient.get<{ data: PaymentData }>(`/payments/split/token/${token}`);
      setPaymentData(response.data.data);

      if (response.data.data.status === 'PAID') {
        toast.info('Este pagamento já foi realizado');
      }
    } catch (error: any) {
      console.error('Error fetching payment data:', error);
      toast.error('Link de pagamento inválido ou expirado');
      setTimeout(() => router.push('/'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentData) return;

    if (paymentMethod === 'CREDIT_CARD') {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        toast.error('Preencha todos os dados do cartão');
        return;
      }
    }

    setIsProcessing(true);

    try {
      await apiClient.post(`/payments/split/${paymentData.id}/process`, {
        method: paymentMethod,
        gateway: 'STRIPE',
        paymentDetails: paymentMethod === 'CREDIT_CARD' ? {
          cardNumber,
          cardName,
          cardExpiry,
          cardCvv,
        } : undefined,
      });

      toast.success('Pagamento realizado com sucesso!');

      // Update payment data
      setPaymentData({ ...paymentData, status: 'PAID' });
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || 'Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando dados do pagamento..." />;
  }

  if (!paymentData) {
    return null;
  }

  const isPaid = paymentData.status === 'PAID';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {isPaid ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    Pagamento Realizado!
                  </h2>
                  <p className="text-green-700 mb-4">
                    Obrigado pelo pagamento. Sua parte da conta já foi quitada.
                  </p>
                  <Separator className="my-6" />
                  <div className="text-left space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Restaurante:</strong> {paymentData.order.restaurant.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Mesa:</strong> {paymentData.order.tableNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Valor pago:</strong> {formatPrice(paymentData.amount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Payment Info */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Informações do Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Restaurante:</span>
                      <span className="font-medium">{paymentData.order.restaurant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mesa:</span>
                      <span className="font-medium">{paymentData.order.tableNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Responsável:</span>
                      <span className="font-medium">{paymentData.user.fullName}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-semibold">Valor a pagar:</span>
                      <span className="text-3xl font-bold text-orange-600">
                        {formatPrice(paymentData.amount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Forma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Método de Pagamento</Label>
                    <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMethod === 'PIX' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                      <div className="text-4xl mb-4">📱</div>
                      <p className="text-blue-800 font-medium mb-2">Pagamento via PIX</p>
                      <p className="text-sm text-blue-600 mb-4">
                        Escaneie o QR Code abaixo ou copie o código PIX
                      </p>
                      <div className="w-48 h-48 bg-white mx-auto mb-4 flex items-center justify-center border-2 border-blue-300 rounded">
                        <p className="text-gray-400">QR Code PIX</p>
                      </div>
                      <Button variant="outline" className="w-full">
                        📋 Copiar Código PIX
                      </Button>
                    </div>
                  )}

                  {paymentMethod === 'CREDIT_CARD' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Número do Cartão</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          maxLength={19}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardName">Nome no Cartão</Label>
                        <Input
                          id="cardName"
                          placeholder="NOME COMPLETO"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cardExpiry">Validade</Label>
                          <Input
                            id="cardExpiry"
                            placeholder="MM/AA"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardCvv">CVV</Label>
                          <Input
                            id="cardCvv"
                            placeholder="123"
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processando...' : `Pagar ${formatPrice(paymentData.amount)}`}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Pagamento seguro processado via gateway de pagamento certificado
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
