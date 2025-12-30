'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { MenuItemCard } from '@/components/menu';
import { LoadingScreen, LoadingSpinner } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MemberApprovalModal, WaitingApproval } from '@/app/mesa/components';
import { toast } from 'sonner';
import { Users, LogIn, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import type {
  TableSession,
  TableSessionMember,
  MemberStatus
} from '@/lib/types';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  acceptingOrders: boolean;
}

type PageState =
  | 'loading'
  | 'not-authenticated'
  | 'new-session'
  | 'waiting-approval'
  | 'approved'
  | 'rejected'
  | 'menu';

export default function TableMenuPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const restaurantId = params.restaurantId as string;
  const tableNumber = parseInt(params.tableNumber as string, 10);

  const [pageState, setPageState] = useState<PageState>('loading');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tableSession, setTableSession] = useState<TableSession | null>(null);
  const [currentMember, setCurrentMember] = useState<TableSessionMember | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    getTotal,
    getItemCount,
    clearCart,
    setRestaurant: setCartRestaurant,
    setTableNumber: setCartTableNumber,
  } = useCartStore();

  // Validate table number
  useEffect(() => {
    if (isNaN(tableNumber) || tableNumber <= 0) {
      toast.error('Numero da mesa invalido');
      router.push('/');
    }
  }, [tableNumber, router]);

  // Fetch restaurant data
  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantData();
    }
  }, [restaurantId]);

  // Check session and auth status
  useEffect(() => {
    if (!authLoading && restaurantId && !isNaN(tableNumber)) {
      checkTableSession();
    }
  }, [authLoading, restaurantId, tableNumber, isAuthenticated]);

  // Polling for approval status
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (pageState === 'waiting-approval' && currentMember) {
      interval = setInterval(() => {
        checkMemberStatus();
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pageState, currentMember]);

  const fetchRestaurantData = async () => {
    try {
      const restaurantRes = await apiClient.get<{ data: Restaurant }>(`/restaurants/${restaurantId}`);
      const restaurantData = restaurantRes.data.data;
      setRestaurant(restaurantData);
      setCartRestaurant(restaurantData.id);
      setCartTableNumber(tableNumber);
    } catch (error: unknown) {
      console.error('Error fetching restaurant data:', error);
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        toast.error('Restaurante nao encontrado');
        router.push('/');
      } else {
        toast.error('Erro ao carregar dados do restaurante');
      }
    }
  };

  const fetchMenu = async () => {
    try {
      const menuRes = await apiClient.get<{ data: Category[] }>(`/menu/restaurant/${restaurantId}/full`);
      const menuData = Array.isArray(menuRes.data.data) ? menuRes.data.data : [];
      setCategories(menuData);
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast.error('Erro ao carregar cardapio');
    }
  };

  const checkTableSession = async () => {
    try {
      // Check if there's an active session
      const response = await apiClient.get<{ data: TableSession | null }>(
        `/tables/${restaurantId}/${tableNumber}/session`
      );

      const session = response.data.data;

      if (!session) {
        // No session exists
        if (isAuthenticated) {
          setPageState('new-session');
        } else {
          setPageState('not-authenticated');
        }
        return;
      }

      setTableSession(session);

      // Check if current user is in the session
      if (isAuthenticated && user) {
        const member = session.members.find((m) => m.userId === user.id);

        if (member) {
          setCurrentMember(member);

          if (member.status === 'APPROVED') {
            setPageState('menu');
            await fetchMenu();
          } else if (member.status === 'PENDING') {
            setPageState('waiting-approval');
          } else if (member.status === 'REJECTED') {
            setPageState('rejected');
          }
        } else {
          // User is authenticated but not in session
          await joinTableSession();
        }
      } else {
        // Not authenticated, ask to login or continue as guest
        setPageState('not-authenticated');
      }
    } catch (error) {
      console.error('Error checking table session:', error);
      setPageState('not-authenticated');
    } finally {
      if (pageState === 'loading') {
        setPageState('not-authenticated');
      }
    }
  };

  const createTableSession = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Voce precisa estar autenticado');
      return;
    }

    try {
      const response = await apiClient.post<{ data: TableSession }>(
        `/tables/${restaurantId}/${tableNumber}/session`,
        {}
      );

      const session = response.data.data;
      setTableSession(session);

      const member = session.members.find((m) => m.userId === user.id);
      setCurrentMember(member || null);

      toast.success('Mesa iniciada! Voce e o responsavel.');
      setPageState('menu');
      await fetchMenu();
    } catch (error) {
      console.error('Error creating table session:', error);
      toast.error('Erro ao iniciar mesa');
    }
  };

  const joinTableSession = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Voce precisa estar autenticado');
      return;
    }

    try {
      const response = await apiClient.post<{ data: TableSession }>(
        `/tables/${restaurantId}/${tableNumber}/session/join`,
        {}
      );

      const session = response.data.data;
      setTableSession(session);

      const member = session.members.find((m) => m.userId === user.id);
      setCurrentMember(member || null);

      if (member?.status === 'PENDING') {
        setPageState('waiting-approval');
        toast.info('Aguardando aprovacao do responsavel');
      } else if (member?.status === 'APPROVED') {
        setPageState('menu');
        await fetchMenu();
        toast.success('Bem-vindo a mesa!');
      }
    } catch (error) {
      console.error('Error joining table session:', error);
      toast.error('Erro ao entrar na mesa');
    }
  };

  const checkMemberStatus = async () => {
    if (!currentMember || !tableSession) return;

    try {
      const response = await apiClient.get<{ data: TableSession }>(
        `/tables/${restaurantId}/${tableNumber}/session`
      );

      const session = response.data.data;
      const member = session.members.find((m) => m.id === currentMember.id);

      if (member && member.status !== currentMember.status) {
        setCurrentMember(member);
        setTableSession(session);

        if (member.status === 'APPROVED') {
          setPageState('menu');
          await fetchMenu();
          toast.success('Voce foi aprovado! Bem-vindo.');
        } else if (member.status === 'REJECTED') {
          setPageState('rejected');
          toast.error('Sua solicitacao foi rejeitada');
        }
      }
    } catch (error) {
      console.error('Error checking member status:', error);
    }
  };

  const handleApproveMember = async (memberId: string) => {
    if (!tableSession) return;

    try {
      await apiClient.patch(
        `/tables/session/${tableSession.id}/member/${memberId}`,
        { approved: true }
      );

      // Refresh session data
      await checkTableSession();
      toast.success('Membro aprovado');
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error('Erro ao aprovar membro');
    }
  };

  const handleRejectMember = async (memberId: string) => {
    if (!tableSession) return;

    try {
      await apiClient.patch(
        `/tables/session/${tableSession.id}/member/${memberId}`,
        { approved: false }
      );

      // Refresh session data
      await checkTableSession();
      toast.success('Membro rejeitado');
    } catch (error) {
      console.error('Error rejecting member:', error);
      toast.error('Erro ao rejeitar membro');
    }
  };

  const handleLoginRedirect = () => {
    // Save return URL
    sessionStorage.setItem('returnUrl', window.location.pathname);
    router.push('/login');
  };

  const handleGuestContinue = async () => {
    // TODO: Implement guest account creation
    toast.info('Funcionalidade em desenvolvimento');
  };

  const handleAddToCart = (item: { id: string; name: string; price: number }) => {
    addItem(item);
    toast.success(`${item.name} adicionado ao carrinho`);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Seu carrinho esta vazio');
      return;
    }

    router.push(`/checkout/${restaurant?.id}`);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // RENDER: Loading
  if (pageState === 'loading' || authLoading) {
    return <LoadingScreen message="Carregando..." />;
  }

  // RENDER: Not Authenticated
  if (pageState === 'not-authenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Users className="h-16 w-16 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Bem-vindo ao {restaurant?.name || 'Restaurante'}
                </h1>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  Mesa {tableNumber}
                </Badge>
              </div>
              <p className="text-gray-600">
                Para acessar o cardapio e fazer pedidos, escolha uma opcao:
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleLoginRedirect}
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Entrar com minha conta
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleGuestContinue}
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Continuar como convidado
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // RENDER: New Session (First to arrive)
  if (pageState === 'new-session') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Voce e o primeiro!
                </h1>
                <p className="text-gray-600">
                  Voce sera o responsavel pela mesa {tableNumber}
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-left space-y-2">
                <p className="font-medium text-gray-900">Como responsavel, voce podera:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Aprovar outros membros na mesa</li>
                  <li>Gerenciar pedidos da mesa</li>
                  <li>Dividir a conta no final</li>
                </ul>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={createTableSession}
              >
                <Users className="h-5 w-5 mr-2" />
                Iniciar Mesa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // RENDER: Waiting Approval
  if (pageState === 'waiting-approval' && tableSession) {
    return (
      <WaitingApproval
        ownerName={tableSession.ownerName}
        restaurantName={restaurant?.name || 'Restaurante'}
        tableNumber={tableNumber}
      />
    );
  }

  // RENDER: Rejected
  if (pageState === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Solicitacao Rejeitada
                </h1>
                <p className="text-gray-600">
                  O responsavel da mesa nao aprovou sua entrada
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => {
                    setPageState('loading');
                    checkTableSession();
                  }}
                >
                  Tentar Novamente
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/')}
                >
                  Voltar ao Inicio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // RENDER: Menu (Approved)
  if (!restaurant) {
    return <LoadingScreen message="Carregando restaurante..." />;
  }

  const isOwner = currentMember?.isOwner || false;
  const pendingMembers = tableSession?.members.filter((m) => m.status === 'PENDING') || [];
  const approvedMembers = tableSession?.members.filter((m) => m.status === 'APPROVED') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with table info */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  Mesa {tableNumber}
                </Badge>
                {isOwner && (
                  <Badge className="bg-orange-600">Responsavel</Badge>
                )}
              </div>
              {restaurant.description && (
                <p className="text-gray-600 mb-3">{restaurant.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {restaurant.acceptingOrders ? (
                <Badge className="bg-green-600">Aberto</Badge>
              ) : (
                <Badge variant="secondary">Fechado</Badge>
              )}
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMemberModal(true)}
                  className="relative"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Membros ({tableSession?.members.length || 0})
                  {pendingMembers.length > 0 && (
                    <Badge
                      className="ml-2 bg-orange-600 text-white h-5 w-5 p-0 flex items-center justify-center"
                    >
                      {pendingMembers.length}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                  Cardapio em construcao
                </h2>
                <p className="text-gray-500">Este restaurante ainda nao tem itens no menu</p>
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map((category) => (
                  <div key={category.id}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(category.items) &&
                        category.items.map((item) => (
                          <MenuItemCard
                            key={item.id}
                            {...item}
                            category={category.name}
                            onAddToCart={handleAddToCart}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      Carrinho ({getItemCount()} {getItemCount() === 1 ? 'item' : 'itens'})
                    </CardTitle>
                    <Badge variant="outline">Mesa {tableNumber}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🛒</div>
                      <p>Seu carrinho esta vazio</p>
                      <p className="text-sm mt-2">Adicione itens do cardapio</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="text-red-600"
                              >
                                X
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-orange-600">{formatPrice(getTotal())}</span>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Button
                          className="w-full"
                          onClick={handleCheckout}
                          disabled={!restaurant.acceptingOrders}
                        >
                          Finalizar Pedido
                        </Button>
                        <Button variant="outline" className="w-full" onClick={clearCart}>
                          Limpar Carrinho
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Member Approval Modal */}
      {isOwner && tableSession && (
        <MemberApprovalModal
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          pendingMembers={pendingMembers}
          approvedMembers={approvedMembers}
          onApprove={handleApproveMember}
          onReject={handleRejectMember}
        />
      )}
    </div>
  );
}
