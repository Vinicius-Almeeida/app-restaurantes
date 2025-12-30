'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { adminApi, type Consultant } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Percent, Store, Calendar, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

function ConsultantsPageContent() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConsultants = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await adminApi.listConsultants();
      setConsultants(Array.isArray(data) ? data : []);

      if (isRefresh) toast.success('Consultores atualizados');
    } catch (error) {
      console.error('Error fetching consultants:', error);
      toast.error('Erro ao carregar consultores');
      setConsultants([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConsultants();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-orange-600" />
          <p className="mt-4 text-gray-600">Carregando consultores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultores</h1>
          <p className="text-gray-600">Gerencie os consultores de onboarding</p>
        </div>
        <Button
          onClick={() => fetchConsultants(true)}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Consultores</p>
                <p className="text-2xl font-bold">{consultants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Store className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Restaurantes Onboarded</p>
                <p className="text-2xl font-bold">
                  {consultants.reduce((acc, c) => acc + (c._count?.onboardedRestaurants || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Percent className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Comissao Media</p>
                <p className="text-2xl font-bold">
                  {consultants.length > 0
                    ? (consultants.reduce((acc, c) => acc + c.commissionPercent, 0) / consultants.length).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultants Grid */}
      {consultants.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Nenhum consultor encontrado</h3>
              <p className="text-gray-600">Ainda nao ha consultores cadastrados na plataforma.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {consultants.map((consultant) => (
            <Card key={consultant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{consultant.user.fullName}</CardTitle>
                    <p className="text-sm text-gray-600">{consultant.user.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Percent className="h-4 w-4" />
                    <span className="text-sm">Comissao</span>
                  </div>
                  <Badge variant="secondary" className="font-semibold">
                    {consultant.commissionPercent}%
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Store className="h-4 w-4" />
                    <span className="text-sm">Restaurantes</span>
                  </div>
                  <Badge variant="outline" className="font-semibold">
                    {consultant._count?.onboardedRestaurants || 0}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Desde</span>
                  </div>
                  <span className="text-sm font-medium">{formatDate(consultant.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConsultantsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <ConsultantsPageContent />
    </ProtectedRoute>
  );
}
