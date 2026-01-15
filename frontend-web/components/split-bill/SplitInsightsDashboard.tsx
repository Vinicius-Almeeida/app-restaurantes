/**
 * Split Insights Dashboard Component
 * Shows user's split analytics and history
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  History,
  Award,
  PieChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getSplitInsights,
  type SplitInsights,
  type SplitMethod,
} from '@/lib/api/smart-split';

const METHOD_LABELS: Record<SplitMethod, string> = {
  EQUAL: 'Dividir Igualmente',
  BY_ITEM: 'Por Item',
  CUSTOM: 'Customizado',
  PERCENTAGE: 'Por Porcentagem',
};

const METHOD_COLORS: Record<SplitMethod, string> = {
  EQUAL: 'bg-blue-500',
  BY_ITEM: 'bg-green-500',
  CUSTOM: 'bg-orange-500',
  PERCENTAGE: 'bg-purple-500',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function SplitInsightsDashboard() {
  const [insights, setInsights] = useState<SplitInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      try {
        setLoading(true);
        const data = await getSplitInsights();
        setInsights(data);
      } catch (err) {
        console.error('[SplitInsights] Failed to fetch:', err);
        setError('Não foi possível carregar seus insights');
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-8 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!insights?.globalStats) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum dado ainda
          </h3>
          <p className="text-gray-500">
            Comece a dividir contas para ver seus insights aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  const { globalStats, recentDecisions, groups } = insights;

  // Calculate method distribution percentages
  const totalMethods =
    globalStats.equalSplitCount +
    globalStats.byItemSplitCount +
    globalStats.customSplitCount +
    globalStats.percentageSplitCount;

  const methodDistribution = [
    { method: 'EQUAL' as SplitMethod, count: globalStats.equalSplitCount },
    { method: 'BY_ITEM' as SplitMethod, count: globalStats.byItemSplitCount },
    { method: 'CUSTOM' as SplitMethod, count: globalStats.customSplitCount },
    { method: 'PERCENTAGE' as SplitMethod, count: globalStats.percentageSplitCount },
  ].filter((m) => m.count > 0);

  // Find most used method
  const mostUsedMethod = methodDistribution.reduce(
    (max, curr) => (curr.count > max.count ? curr : max),
    methodDistribution[0]
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{globalStats.totalSplits}</p>
                <p className="text-sm text-gray-500">Total de Divisões</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {globalStats.avgParticipants.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">Média Participantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <DollarSign className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(globalStats.avgSplitAmount)}
                </p>
                <p className="text-sm text-gray-500">Valor Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold">
                  {mostUsedMethod ? METHOD_LABELS[mostUsedMethod.method] : '-'}
                </p>
                <p className="text-sm text-gray-500">Método Favorito</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Method Distribution */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg">Distribuição por Método</CardTitle>
          </div>
          <CardDescription>
            Como você tem dividido suas contas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {methodDistribution.map((item) => {
            const percentage =
              totalMethods > 0 ? (item.count / totalMethods) * 100 : 0;
            return (
              <div key={item.method} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {METHOD_LABELS[item.method]}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <Progress
                  value={percentage}
                  className={cn('h-2', METHOD_COLORS[item.method])}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Decisions */}
      {recentDecisions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg">Histórico Recente</CardTitle>
            </div>
            <CardDescription>
              Suas últimas divisões de conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDecisions.map((decision) => (
                <div
                  key={decision.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          decision.suggestionAccepted
                            ? 'bg-green-50 text-green-700 border-green-300'
                            : 'bg-gray-50 text-gray-700 border-gray-300'
                        )}
                      >
                        {METHOD_LABELS[decision.chosenMethod]}
                      </Badge>
                      {decision.suggestionAccepted && (
                        <Badge className="bg-purple-100 text-purple-700">
                          Sugestão IA
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {decision.participantCount} participantes •{' '}
                      {formatDate(decision.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(decision.totalAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Frequent Groups */}
      {groups.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg">Grupos Frequentes</CardTitle>
            </div>
            <CardDescription>
              Pessoas com quem você costuma dividir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {Array.from({ length: Math.min(group.memberCount, 3) }).map(
                        (_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center"
                          >
                            <span className="text-xs font-medium text-orange-700">
                              {i + 1}
                            </span>
                          </div>
                        )
                      )}
                      {group.memberCount > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600">
                            +{group.memberCount - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {group.groupName || `Grupo de ${group.memberCount}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {group.splitCount} divisões •{' '}
                        {METHOD_LABELS[group.commonSplitMethod]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
