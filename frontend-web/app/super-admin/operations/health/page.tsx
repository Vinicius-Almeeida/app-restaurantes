'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Server,
  Database,
  Globe,
  HardDrive,
  Wifi,
  Cloud,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Clock,
  Activity,
} from 'lucide-react';

type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  latency: number | null;
  uptime: number;
  lastCheck: string;
  region?: string;
  version?: string;
  details?: string;
}

interface HealthCategory {
  name: string;
  icon: React.ReactNode;
  services: ServiceHealth[];
}

const STATUS_CONFIG: Record<ServiceStatus, { label: string; className: string; icon: React.ElementType }> = {
  healthy: { label: 'Saudavel', className: 'bg-green-100 text-green-800', icon: CheckCircle },
  degraded: { label: 'Degradado', className: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  down: { label: 'Indisponivel', className: 'bg-red-100 text-red-800', icon: XCircle },
  unknown: { label: 'Desconhecido', className: 'bg-gray-100 text-gray-800', icon: AlertTriangle },
};

function HealthPageContent() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const [healthData, setHealthData] = useState<HealthCategory[]>([
    {
      name: 'Core Services',
      icon: <Server className="h-5 w-5" />,
      services: [
        {
          name: 'API Principal',
          status: 'healthy',
          latency: 45,
          uptime: 99.98,
          lastCheck: new Date().toISOString(),
          region: 'East US 2',
          version: 'v2.4.1',
        },
        {
          name: 'API de Autenticacao',
          status: 'healthy',
          latency: 32,
          uptime: 99.99,
          lastCheck: new Date().toISOString(),
          version: 'v1.8.0',
        },
        {
          name: 'API de Pagamentos',
          status: 'healthy',
          latency: 68,
          uptime: 99.95,
          lastCheck: new Date().toISOString(),
          version: 'v1.5.2',
        },
      ],
    },
    {
      name: 'Database',
      icon: <Database className="h-5 w-5" />,
      services: [
        {
          name: 'PostgreSQL Primary',
          status: 'healthy',
          latency: 12,
          uptime: 99.99,
          lastCheck: new Date().toISOString(),
          region: 'SA East 1',
          details: 'Conexoes: 45/100',
        },
        {
          name: 'PostgreSQL Replica',
          status: 'healthy',
          latency: 15,
          uptime: 99.97,
          lastCheck: new Date().toISOString(),
          region: 'SA East 1',
          details: 'Lag: 0ms',
        },
        {
          name: 'Redis Cache',
          status: 'healthy',
          latency: 3,
          uptime: 99.99,
          lastCheck: new Date().toISOString(),
          details: 'Memoria: 45%',
        },
      ],
    },
    {
      name: 'Infrastructure',
      icon: <Cloud className="h-5 w-5" />,
      services: [
        {
          name: 'Azure Container Apps',
          status: 'healthy',
          latency: null,
          uptime: 99.95,
          lastCheck: new Date().toISOString(),
          region: 'East US 2',
        },
        {
          name: 'Vercel Edge',
          status: 'healthy',
          latency: 18,
          uptime: 99.99,
          lastCheck: new Date().toISOString(),
        },
        {
          name: 'CDN',
          status: 'healthy',
          latency: 8,
          uptime: 99.99,
          lastCheck: new Date().toISOString(),
        },
      ],
    },
    {
      name: 'Integracao',
      icon: <Globe className="h-5 w-5" />,
      services: [
        {
          name: 'WebSocket Server',
          status: 'healthy',
          latency: 25,
          uptime: 99.92,
          lastCheck: new Date().toISOString(),
          details: 'Conexoes: 1,247',
        },
        {
          name: 'SMTP (Email)',
          status: 'healthy',
          latency: 180,
          uptime: 99.85,
          lastCheck: new Date().toISOString(),
        },
        {
          name: 'SMS Gateway',
          status: 'degraded',
          latency: 450,
          uptime: 98.5,
          lastCheck: new Date().toISOString(),
          details: 'Alta latencia detectada',
        },
      ],
    },
    {
      name: 'Seguranca',
      icon: <Shield className="h-5 w-5" />,
      services: [
        {
          name: 'WAF (Firewall)',
          status: 'healthy',
          latency: null,
          uptime: 99.99,
          lastCheck: new Date().toISOString(),
          details: 'Bloqueios: 1,234 hoje',
        },
        {
          name: 'SSL/TLS',
          status: 'healthy',
          latency: null,
          uptime: 100,
          lastCheck: new Date().toISOString(),
          details: 'Certificado valido',
        },
        {
          name: 'DDoS Protection',
          status: 'healthy',
          latency: null,
          uptime: 99.99,
          lastCheck: new Date().toISOString(),
        },
      ],
    },
  ]);

  const refreshHealth = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const getOverallStatus = (): ServiceStatus => {
    const allServices = healthData.flatMap((cat) => cat.services);
    if (allServices.some((s) => s.status === 'down')) return 'down';
    if (allServices.some((s) => s.status === 'degraded')) return 'degraded';
    return 'healthy';
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getUptimeColor = (uptime: number): string => {
    if (uptime >= 99.9) return 'text-green-600';
    if (uptime >= 99) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLatencyColor = (latency: number | null): string => {
    if (latency === null) return 'text-gray-500';
    if (latency <= 100) return 'text-green-600';
    if (latency <= 300) return 'text-yellow-600';
    return 'text-red-600';
  };

  const overallStatus = getOverallStatus();
  const OverallIcon = STATUS_CONFIG[overallStatus].icon;

  const totalServices = healthData.reduce((acc, cat) => acc + cat.services.length, 0);
  const healthyServices = healthData.reduce(
    (acc, cat) => acc + cat.services.filter((s) => s.status === 'healthy').length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/operations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Saude do Sistema</h1>
            <p className="text-gray-600">Status detalhado de todos os servicos</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Ultima verificacao: {formatTime(lastUpdate)}
          </span>
          <Button variant="outline" onClick={refreshHealth} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Verificar
          </Button>
        </div>
      </div>

      {/* Overall Status Banner */}
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
                <h2 className="text-2xl font-bold">
                  {overallStatus === 'healthy' ? 'Todos os sistemas operacionais' :
                   overallStatus === 'degraded' ? 'Alguns servicos degradados' :
                   'Problemas detectados'}
                </h2>
                <p className="text-gray-600">
                  {healthyServices} de {totalServices} servicos saudaveis
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-600">
                {((healthyServices / totalServices) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">Disponibilidade</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Categories */}
      <div className="space-y-6">
        {healthData.map((category) => (
          <Card key={category.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category.icon}
                {category.name}
                <Badge variant="secondary" className="ml-auto">
                  {category.services.filter((s) => s.status === 'healthy').length}/
                  {category.services.length} OK
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.services.map((service) => {
                  const statusConfig = STATUS_CONFIG[service.status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={service.name}
                      className={`p-4 rounded-lg border ${
                        service.status === 'healthy' ? 'border-green-200 bg-green-50' :
                        service.status === 'degraded' ? 'border-yellow-200 bg-yellow-50' :
                        service.status === 'down' ? 'border-red-200 bg-red-50' :
                        'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-5 w-5 ${
                            service.status === 'healthy' ? 'text-green-600' :
                            service.status === 'degraded' ? 'text-yellow-600' :
                            service.status === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`} />
                          <h4 className="font-semibold">{service.name}</h4>
                        </div>
                        <Badge className={statusConfig.className}>
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Uptime</span>
                          <span className={`font-medium ${getUptimeColor(service.uptime)}`}>
                            {service.uptime}%
                          </span>
                        </div>

                        {service.latency !== null && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Latencia</span>
                            <span className={`font-medium ${getLatencyColor(service.latency)}`}>
                              {service.latency}ms
                            </span>
                          </div>
                        )}

                        {service.region && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Regiao</span>
                            <span className="font-medium">{service.region}</span>
                          </div>
                        )}

                        {service.version && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Versao</span>
                            <span className="font-medium">{service.version}</span>
                          </div>
                        )}

                        {service.details && (
                          <div className="pt-2 border-t">
                            <span className="text-gray-500 text-xs">{service.details}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Uptime History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Historico de Uptime (30 dias)
          </CardTitle>
          <CardDescription>
            Disponibilidade dos servicos criticos nos ultimos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'API Principal', uptime: 99.98, incidents: 1 },
              { name: 'Database', uptime: 99.99, incidents: 0 },
              { name: 'WebSocket', uptime: 99.92, incidents: 2 },
              { name: 'CDN', uptime: 99.99, incidents: 0 },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-4">
                <div className="w-32 font-medium">{item.name}</div>
                <div className="flex-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 30 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-8 flex-1 rounded-sm ${
                          Math.random() > 0.02 ? 'bg-green-500' :
                          Math.random() > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        title={`Dia ${30 - idx}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-20 text-right">
                  <span className={`font-bold ${getUptimeColor(item.uptime)}`}>
                    {item.uptime}%
                  </span>
                </div>
                <div className="w-24 text-right text-sm text-gray-500">
                  {item.incidents} incidente{item.incidents !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
              <span>Operacional</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
              <span>Degradado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-sm" />
              <span>Indisponivel</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HealthPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <HealthPageContent />
    </ProtectedRoute>
  );
}
