'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  ArrowRight,
  XCircle,
} from 'lucide-react';

interface SystemStatus {
  api: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  cache: 'healthy' | 'degraded' | 'down';
  websocket: 'healthy' | 'degraded' | 'down';
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  requestsPerMinute: number;
  averageResponseTime: number;
}

interface RecentAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

const STATUS_CONFIG = {
  healthy: { label: 'Saudavel', className: 'bg-green-100 text-green-800', icon: CheckCircle },
  degraded: { label: 'Degradado', className: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  down: { label: 'Indisponivel', className: 'bg-red-100 text-red-800', icon: XCircle },
};

function OperationsPageContent() {
  const [status, setStatus] = useState<SystemStatus>({
    api: 'healthy',
    database: 'healthy',
    cache: 'healthy',
    websocket: 'healthy',
  });

  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    activeConnections: 1247,
    requestsPerMinute: 3420,
    averageResponseTime: 142,
  });

  const [alerts, setAlerts] = useState<RecentAlert[]>([
    {
      id: '1',
      type: 'warning',
      message: 'Alta latencia detectada na regiao Sul',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      resolved: false,
    },
    {
      id: '2',
      type: 'info',
      message: 'Backup automatico concluido com sucesso',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      resolved: true,
    },
    {
      id: '3',
      type: 'error',
      message: 'Falha temporaria no servico de email',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      resolved: true,
    },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simular refresh de dados
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Simular atualizacao de metricas em tempo real
      setMetrics((prev) => ({
        ...prev,
        cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(40, Math.min(85, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        activeConnections: Math.max(1000, prev.activeConnections + Math.floor((Math.random() - 0.5) * 100)),
        requestsPerMinute: Math.max(2000, prev.requestsPerMinute + Math.floor((Math.random() - 0.5) * 200)),
        averageResponseTime: Math.max(80, Math.min(300, prev.averageResponseTime + (Math.random() - 0.5) * 20)),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getOverallStatus = (): 'healthy' | 'degraded' | 'down' => {
    const statuses = Object.values(status);
    if (statuses.includes('down')) return 'down';
    if (statuses.includes('degraded')) return 'degraded';
    return 'healthy';
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins} min atras`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atras`;
    return `${Math.floor(diffHours / 24)}d atras`;
  };

  const overallStatus = getOverallStatus();
  const OverallIcon = STATUS_CONFIG[overallStatus].icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operacoes</h1>
          <p className="text-gray-600">Monitoramento e saude do sistema</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Atualizado: {formatTime(lastUpdate)}
          </span>
          <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className={`border-l-4 ${
        overallStatus === 'healthy' ? 'border-l-green-500' :
        overallStatus === 'degraded' ? 'border-l-yellow-500' : 'border-l-red-500'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${
                overallStatus === 'healthy' ? 'bg-green-100' :
                overallStatus === 'degraded' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <OverallIcon className={`h-8 w-8 ${
                  overallStatus === 'healthy' ? 'text-green-600' :
                  overallStatus === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Status Geral: {STATUS_CONFIG[overallStatus].label}</h2>
                <p className="text-gray-600">Todos os servicos estao operando normalmente</p>
              </div>
            </div>
            <Badge className={STATUS_CONFIG[overallStatus].className}>
              {STATUS_CONFIG[overallStatus].label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/super-admin/operations/realtime">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  Tempo Real
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </CardTitle>
              <CardDescription>
                Monitore pedidos e transacoes em tempo real
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/super-admin/operations/health">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-green-600" />
                  Saude do Sistema
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </CardTitle>
              <CardDescription>
                Status detalhado de todos os servicos
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/super-admin/operations/alerts">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Alertas
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </CardTitle>
              <CardDescription>
                Gerencie alertas e incidentes
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Status dos Servicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(status).map(([service, serviceStatus]) => {
              const config = STATUS_CONFIG[serviceStatus];
              const Icon = config.icon;
              const serviceNames: Record<string, { name: string; icon: React.ReactNode }> = {
                api: { name: 'API Backend', icon: <Globe className="h-5 w-5" /> },
                database: { name: 'Database', icon: <Database className="h-5 w-5" /> },
                cache: { name: 'Cache (Redis)', icon: <HardDrive className="h-5 w-5" /> },
                websocket: { name: 'WebSocket', icon: <Wifi className="h-5 w-5" /> },
              };

              return (
                <div key={service} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    serviceStatus === 'healthy' ? 'bg-green-100' :
                    serviceStatus === 'degraded' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    {serviceNames[service]?.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{serviceNames[service]?.name}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <Icon className={`h-3 w-3 ${
                        serviceStatus === 'healthy' ? 'text-green-600' :
                        serviceStatus === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                      <span className={
                        serviceStatus === 'healthy' ? 'text-green-600' :
                        serviceStatus === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                      }>
                        {config.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-600" />
                <span className="font-medium">CPU</span>
              </div>
              <span className="text-2xl font-bold">{metrics.cpuUsage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  metrics.cpuUsage > 80 ? 'bg-red-600' :
                  metrics.cpuUsage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${metrics.cpuUsage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Memoria</span>
              </div>
              <span className="text-2xl font-bold">{metrics.memoryUsage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  metrics.memoryUsage > 80 ? 'bg-red-600' :
                  metrics.memoryUsage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${metrics.memoryUsage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Disco</span>
              </div>
              <span className="text-2xl font-bold">{metrics.diskUsage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  metrics.diskUsage > 80 ? 'bg-red-600' :
                  metrics.diskUsage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${metrics.diskUsage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wifi className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Conexoes Ativas</p>
                <p className="text-2xl font-bold">{metrics.activeConnections.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Requisicoes/min</p>
                <p className="text-2xl font-bold">{metrics.requestsPerMinute.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tempo Medio Resposta</p>
                <p className="text-2xl font-bold">{metrics.averageResponseTime.toFixed(0)}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Recentes
            </CardTitle>
            <Link href="/super-admin/operations/alerts">
              <Button variant="ghost" size="sm">
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum alerta recente
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    alert.type === 'error' ? 'bg-red-50' :
                    alert.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
                  }`}
                >
                  {alert.type === 'error' ? (
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  ) : alert.type === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-gray-500">{formatRelativeTime(alert.timestamp)}</p>
                  </div>
                  <Badge variant={alert.resolved ? 'secondary' : 'outline'}>
                    {alert.resolved ? 'Resolvido' : 'Ativo'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function OperationsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <OperationsPageContent />
    </ProtectedRoute>
  );
}
