'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  RefreshCw,
  Search,
  Store,
  User,
  CheckCircle,
  Circle,
  Clock,
  Calendar,
  ChevronRight,
  Users,
  CreditCard,
  Utensils,
  LayoutGrid,
  Settings,
  FileCheck,
} from 'lucide-react';

type OnboardingStage = 'pending' | 'in_progress' | 'completed' | 'stalled';

interface OnboardingStep {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: string;
}

interface OnboardingRestaurant {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  consultant?: string;
  stage: OnboardingStage;
  progress: number;
  startedAt: string;
  completedAt?: string;
  steps: OnboardingStep[];
}

const STAGE_CONFIG: Record<OnboardingStage, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'Em Andamento', className: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Concluido', className: 'bg-green-100 text-green-800' },
  stalled: { label: 'Parado', className: 'bg-red-100 text-red-800' },
};

const ONBOARDING_STEPS = [
  { id: 'account', name: 'Conta Criada', icon: User },
  { id: 'profile', name: 'Perfil Completo', icon: Store },
  { id: 'subscription', name: 'Plano Ativo', icon: CreditCard },
  { id: 'menu', name: 'Cardapio Configurado', icon: Utensils },
  { id: 'tables', name: 'Mesas Criadas', icon: LayoutGrid },
  { id: 'staff', name: 'Equipe Cadastrada', icon: Users },
  { id: 'settings', name: 'Configuracoes', icon: Settings },
  { id: 'first_order', name: 'Primeiro Pedido', icon: FileCheck },
];

function OnboardingPageContent() {
  const [restaurants, setRestaurants] = useState<OnboardingRestaurant[]>([
    {
      id: '1',
      name: 'Pizzaria Bella Italia',
      slug: 'pizzaria-bella',
      ownerName: 'Marco Silva',
      ownerEmail: 'marco@bella.com',
      consultant: 'Ana Consultora',
      stage: 'in_progress',
      progress: 62,
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      steps: [
        { id: 'account', name: 'Conta Criada', completed: true, completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
        { id: 'profile', name: 'Perfil Completo', completed: true, completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
        { id: 'subscription', name: 'Plano Ativo', completed: true, completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
        { id: 'menu', name: 'Cardapio Configurado', completed: true, completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
        { id: 'tables', name: 'Mesas Criadas', completed: true, completedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
        { id: 'staff', name: 'Equipe Cadastrada', completed: false },
        { id: 'settings', name: 'Configuracoes', completed: false },
        { id: 'first_order', name: 'Primeiro Pedido', completed: false },
      ],
    },
    {
      id: '2',
      name: 'Sushi Master',
      slug: 'sushi-master',
      ownerName: 'Kenji Tanaka',
      ownerEmail: 'kenji@sushi.com',
      consultant: 'Carlos Consultant',
      stage: 'completed',
      progress: 100,
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      steps: ONBOARDING_STEPS.map((step) => ({
        id: step.id,
        name: step.name,
        completed: true,
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * Math.random() * 8).toISOString(),
      })),
    },
    {
      id: '3',
      name: 'Burger House',
      slug: 'burger-house',
      ownerName: 'John Burger',
      ownerEmail: 'john@burger.com',
      stage: 'pending',
      progress: 12,
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      steps: [
        { id: 'account', name: 'Conta Criada', completed: true, completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        { id: 'profile', name: 'Perfil Completo', completed: false },
        { id: 'subscription', name: 'Plano Ativo', completed: false },
        { id: 'menu', name: 'Cardapio Configurado', completed: false },
        { id: 'tables', name: 'Mesas Criadas', completed: false },
        { id: 'staff', name: 'Equipe Cadastrada', completed: false },
        { id: 'settings', name: 'Configuracoes', completed: false },
        { id: 'first_order', name: 'Primeiro Pedido', completed: false },
      ],
    },
    {
      id: '4',
      name: 'Cantina Italiana',
      slug: 'cantina-italiana',
      ownerName: 'Giuseppe Rossi',
      ownerEmail: 'giuseppe@cantina.com',
      consultant: 'Ana Consultora',
      stage: 'stalled',
      progress: 37,
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      steps: [
        { id: 'account', name: 'Conta Criada', completed: true },
        { id: 'profile', name: 'Perfil Completo', completed: true },
        { id: 'subscription', name: 'Plano Ativo', completed: true },
        { id: 'menu', name: 'Cardapio Configurado', completed: false },
        { id: 'tables', name: 'Mesas Criadas', completed: false },
        { id: 'staff', name: 'Equipe Cadastrada', completed: false },
        { id: 'settings', name: 'Configuracoes', completed: false },
        { id: 'first_order', name: 'Primeiro Pedido', completed: false },
      ],
    },
  ]);

  const [stageFilter, setStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<OnboardingRestaurant | null>(null);

  const filteredRestaurants = restaurants.filter((r) => {
    if (stageFilter !== 'all' && r.stage !== stageFilter) return false;
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDaysSince = (dateString: string): number => {
    const date = new Date(dateString);
    const now = new Date();
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStats = () => ({
    pending: restaurants.filter((r) => r.stage === 'pending').length,
    inProgress: restaurants.filter((r) => r.stage === 'in_progress').length,
    completed: restaurants.filter((r) => r.stage === 'completed').length,
    stalled: restaurants.filter((r) => r.stage === 'stalled').length,
    avgCompletionDays: Math.round(
      restaurants
        .filter((r) => r.completedAt)
        .reduce((acc, r) => acc + getDaysSince(r.startedAt), 0) /
        Math.max(restaurants.filter((r) => r.completedAt).length, 1)
    ),
  });

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/restaurants">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Onboarding</h1>
            <p className="text-gray-600">Acompanhe o processo de setup dos restaurantes</p>
          </div>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Concluidos</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={stats.stalled > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.stalled > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                <Clock className={`h-5 w-5 ${stats.stalled > 0 ? 'text-red-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Parados</p>
                <p className="text-2xl font-bold">{stats.stalled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Media Conclusao</p>
                <p className="text-2xl font-bold">{stats.avgCompletionDays} dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar restaurante..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estagio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estagios</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluido</SelectItem>
                <SelectItem value="stalled">Parado</SelectItem>
              </SelectContent>
            </Select>
            {(stageFilter !== 'all' || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStageFilter('all');
                  setSearchQuery('');
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Restaurant List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Restaurantes em Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRestaurants.length === 0 ? (
              <div className="text-center py-12">
                <Store className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">Nenhum restaurante encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRestaurants.map((restaurant) => {
                  const stageConfig = STAGE_CONFIG[restaurant.stage];
                  const isSelected = selectedRestaurant?.id === restaurant.id;

                  return (
                    <div
                      key={restaurant.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${restaurant.stage === 'stalled' ? 'border-red-200' : ''}`}
                      onClick={() => setSelectedRestaurant(restaurant)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{restaurant.name}</h4>
                          <Badge className={stageConfig.className}>{stageConfig.label}</Badge>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {restaurant.ownerName}
                        </span>
                        {restaurant.consultant && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {restaurant.consultant}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progresso</span>
                          <span>{restaurant.progress}%</span>
                        </div>
                        <Progress value={restaurant.progress} className="h-2" />
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Iniciado ha {getDaysSince(restaurant.startedAt)} dias
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Onboarding Steps Detail */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Etapas do Onboarding
            </CardTitle>
            <CardDescription>
              {selectedRestaurant
                ? `Progresso de ${selectedRestaurant.name}`
                : 'Selecione um restaurante para ver os detalhes'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRestaurant ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Proprietario</p>
                      <p className="font-medium">{selectedRestaurant.ownerName}</p>
                      <p className="text-xs text-gray-500">{selectedRestaurant.ownerEmail}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Consultor</p>
                      <p className="font-medium">
                        {selectedRestaurant.consultant || 'Nao atribuido'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Iniciado em</p>
                      <p className="font-medium">{formatDate(selectedRestaurant.startedAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Dias em Onboarding</p>
                      <p className="font-medium">{getDaysSince(selectedRestaurant.startedAt)} dias</p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-4">
                    {ONBOARDING_STEPS.map((step, idx) => {
                      const restaurantStep = selectedRestaurant.steps.find((s) => s.id === step.id);
                      const isCompleted = restaurantStep?.completed || false;
                      const StepIcon = step.icon;

                      return (
                        <div key={step.id} className="flex items-start gap-4 pl-0 relative">
                          <div
                            className={`z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-white" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 pt-1">
                            <div className="flex items-center gap-2">
                              <StepIcon className={`h-4 w-4 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                              <p className={`font-medium ${isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                                {step.name}
                              </p>
                            </div>
                            {isCompleted && restaurantStep?.completedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Concluido em {formatDate(restaurantStep.completedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedRestaurant.stage === 'stalled' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Atencao: Onboarding Parado</h4>
                    <p className="text-sm text-red-700">
                      Este restaurante nao progrediu nos ultimos 7 dias. Considere entrar em contato
                      com o proprietario ou atribuir um consultor.
                    </p>
                    <Button variant="destructive" size="sm" className="mt-3">
                      Contatar Proprietario
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">
                  Clique em um restaurante para ver o progresso detalhado
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'CONSULTANT']}>
      <OnboardingPageContent />
    </ProtectedRoute>
  );
}
