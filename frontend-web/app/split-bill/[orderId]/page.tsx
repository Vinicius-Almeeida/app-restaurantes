'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { SplitMethodSelector, ParticipantsList } from '@/components/split-bill';
import { LoadingScreen } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

type SplitMethod = 'EQUAL' | 'BY_ITEM' | 'CUSTOM';

interface Participant {
  userId: string;
  name: string;
  email: string;
  amount: number;
  paid: boolean;
}

interface Order {
  id: string;
  tableNumber: number;
  totalAmount: number;
  restaurant: {
    name: string;
  };
}

interface SplitBill {
  id: string;
  method: SplitMethod;
  participants: Participant[];
  paymentLinks: Array<{
    id: string;
    token: string;
    userId: string;
    amount: number;
    status: string;
  }>;
}

export default function SplitBillPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('EQUAL');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [splitBill, setSplitBill] = useState<SplitBill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      const [orderRes, splitRes] = await Promise.all([
        apiClient.get<{ data: Order }>(`/orders/${orderId}`),
        apiClient.get<{ data: SplitBill[] }>(`/payments/split/order/${orderId}`).catch(() => ({ data: { data: [] } })),
      ]);

      setOrder(orderRes.data.data);

      if (splitRes.data.data.length > 0) {
        const existingSplit = splitRes.data.data[0];
        setSplitBill(existingSplit);
        setSplitMethod(existingSplit.method);
      }
    } catch (error: unknown) {
      console.error('Error fetching order:', error);
      toast.error('Erro ao carregar dados do pedido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSplit = async () => {
    if (participants.length === 0) {
      toast.error('Adicione participantes antes de criar a divisão');
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiClient.post<{ data: SplitBill }>(`/payments/split/${orderId}`, {
        method: splitMethod,
        participantIds: participants.map(p => p.userId),
      });

      setSplitBill(response.data.data);
      toast.success('Divisão de conta criada com sucesso!');
    } catch (error: unknown) {
      console.error('Error creating split:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Erro ao criar divisão de conta');
    } finally {
      setIsCreating(false);
    }
  };

  const calculateSplitAmounts = (): Participant[] => {
    if (!order) return [];

    const mockParticipants: Participant[] = [
      { userId: '1', name: 'Você', email: 'you@email.com', amount: 0, paid: false },
      { userId: '2', name: 'Participante 2', email: 'part2@email.com', amount: 0, paid: false },
    ];

    if (splitMethod === 'EQUAL') {
      const amountPerPerson = order.totalAmount / mockParticipants.length;
      return mockParticipants.map(p => ({ ...p, amount: amountPerPerson }));
    }

    // For BY_ITEM and CUSTOM, we would need more complex logic
    // For now, using equal split as default
    const amountPerPerson = order.totalAmount / mockParticipants.length;
    return mockParticipants.map(p => ({ ...p, amount: amountPerPerson }));
  };

  useEffect(() => {
    if (order) {
      setParticipants(calculateSplitAmounts());
    }
  }, [splitMethod, order]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const copyPaymentLink = (token: string) => {
    const link = `${window.location.origin}/pay/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!');
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando..." />;
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🧾 Rachar Conta
            </h1>
            <p className="text-gray-600">
              {order.restaurant.name} • Mesa {order.tableNumber}
            </p>
            <p className="text-2xl font-bold text-orange-600 mt-2">
              Total: {formatPrice(order.totalAmount)}
            </p>
          </div>

          {!splitBill ? (
            <div className="space-y-8">
              {/* Split Method Selection */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  1. Escolha o método de divisão
                </h2>
                <SplitMethodSelector selected={splitMethod} onSelect={setSplitMethod} />
              </div>

              {/* Participants Preview */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  2. Participantes e valores
                </h2>
                <Card>
                  <CardContent className="pt-6">
                    {participants.length > 0 ? (
                      <ParticipantsList participants={participants} />
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        Nenhum participante adicionado
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleCreateSplit}
                  disabled={isCreating || participants.length === 0}
                >
                  {isCreating ? 'Criando...' : 'Criar Divisão de Conta'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push(`/orders/${orderId}`)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Split Created */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">
                      Divisão Criada com Sucesso!
                    </h3>
                    <p className="text-green-700">
                      Os links de pagamento foram gerados para cada participante
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Links de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.isArray(splitBill.paymentLinks) && splitBill.paymentLinks.map((link) => {
                      const participant = Array.isArray(splitBill.participants)
                        ? splitBill.participants.find(p => p.userId === link.userId)
                        : null;
                      return (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-white"
                        >
                          <div>
                            <p className="font-medium">{participant?.name}</p>
                            <p className="text-sm text-gray-500">{participant?.email}</p>
                            <p className="text-lg font-bold text-orange-600 mt-1">
                              {formatPrice(link.amount)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => copyPaymentLink(link.token)}
                            >
                              📋 Copiar Link
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button>Ver QR Code</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>QR Code de Pagamento</DialogTitle>
                                </DialogHeader>
                                <div className="py-8 text-center">
                                  <div className="w-64 h-64 bg-gray-200 mx-auto flex items-center justify-center">
                                    <p className="text-gray-500">QR Code aqui</p>
                                  </div>
                                  <p className="mt-4 text-sm text-gray-600">
                                    {window.location.origin}/pay/{link.token}
                                  </p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator className="my-6" />

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/orders/${orderId}`)}
                    >
                      Voltar ao Pedido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
