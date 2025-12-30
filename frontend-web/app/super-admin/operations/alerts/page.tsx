'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  Clock,
  User,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

type AlertType = 'critical' | 'error' | 'warning' | 'info';
type AlertStatus = 'active' | 'acknowledged' | 'resolved';

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  source: string;
  status: AlertStatus;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
}

const TYPE_CONFIG: Record<AlertType, { label: string; className: string; icon: React.ElementType }> = {
  critical: { label: 'Critico', className: 'bg-red-100 text-red-800', icon: XCircle },
  error: { label: 'Erro', className: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  warning: { label: 'Aviso', className: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  info: { label: 'Info', className: 'bg-blue-100 text-blue-800', icon: Info },
};

const STATUS_CONFIG: Record<AlertStatus, { label: string; className: string }> = {
  active: { label: 'Ativo', className: 'bg-red-100 text-red-800' },
  acknowledged: { label: 'Reconhecido', className: 'bg-yellow-100 text-yellow-800' },
  resolved: { label: 'Resolvido', className: 'bg-green-100 text-green-800' },
};

function AlertsPageContent() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Alta latencia no SMS Gateway',
      message: 'O servico de SMS esta apresentando latencia acima de 400ms. Mensagens podem estar atrasadas.',
      source: 'SMS Gateway',
      status: 'active',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: '2',
      type: 'info',
      title: 'Backup automatico concluido',
      message: 'Backup diario do banco de dados concluido com sucesso. Tamanho: 2.4GB',
      source: 'Database',
      status: 'resolved',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      resolvedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      resolvedBy: 'Sistema',
      resolution: 'Backup automatico finalizado sem erros.',
    },
    {
      id: '3',
      type: 'error',
      title: 'Falha temporaria no servico de email',
      message: 'O servidor SMTP apresentou timeout em 5 tentativas de envio. Emails foram enfileirados.',
      source: 'Email Service',
      status: 'resolved',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      acknowledgedAt: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
      acknowledgedBy: 'admin@tabsync.com',
      resolvedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      resolvedBy: 'admin@tabsync.com',
      resolution: 'Servidor SMTP reiniciado. Fila de emails processada com sucesso.',
    },
    {
      id: '4',
      type: 'critical',
      title: 'Pico de CPU detectado',
      message: 'Uso de CPU atingiu 95% por mais de 5 minutos. Auto-scaling acionado.',
      source: 'Infrastructure',
      status: 'acknowledged',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      acknowledgedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      acknowledgedBy: 'devops@tabsync.com',
    },
    {
      id: '5',
      type: 'warning',
      title: 'Certificado SSL expira em 30 dias',
      message: 'O certificado SSL do dominio app-restaurantes.vercel.app expira em 30 dias.',
      source: 'Security',
      status: 'active',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ]);

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resolution, setResolution] = useState('');

  const filteredAlerts = alerts.filter((alert) => {
    if (typeFilter !== 'all' && alert.type !== typeFilter) return false;
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    if (searchQuery && !alert.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'acknowledged' as AlertStatus,
              acknowledgedAt: new Date().toISOString(),
              acknowledgedBy: 'admin@tabsync.com',
            }
          : a
      )
    );
    toast.success('Alerta reconhecido');
  };

  const handleResolve = () => {
    if (!selectedAlert) return;

    setAlerts((prev) =>
      prev.map((a) =>
        a.id === selectedAlert.id
          ? {
              ...a,
              status: 'resolved' as AlertStatus,
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'admin@tabsync.com',
              resolution,
            }
          : a
      )
    );
    setIsDialogOpen(false);
    setResolution('');
    toast.success('Alerta resolvido');
  };

  const openResolveDialog = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsDialogOpen(true);
  };

  const getAlertCounts = () => ({
    active: alerts.filter((a) => a.status === 'active').length,
    acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
    resolved: alerts.filter((a) => a.status === 'resolved').length,
    critical: alerts.filter((a) => a.type === 'critical' && a.status !== 'resolved').length,
  });

  const counts = getAlertCounts();

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
            <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
            <p className="text-gray-600">Gerencie alertas e incidentes do sistema</p>
          </div>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={counts.critical > 0 ? 'border-red-300 bg-red-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${counts.critical > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                <XCircle className={`h-5 w-5 ${counts.critical > 0 ? 'text-red-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Criticos</p>
                <p className="text-2xl font-bold">{counts.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold">{counts.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reconhecidos</p>
                <p className="text-2xl font-bold">{counts.acknowledged}</p>
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
                <p className="text-sm text-gray-600">Resolvidos</p>
                <p className="text-2xl font-bold">{counts.resolved}</p>
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
                placeholder="Buscar alertas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="critical">Critico</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="acknowledged">Reconhecido</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
              </SelectContent>
            </Select>
            {(typeFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTypeFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Lista de Alertas
            <Badge variant="secondary" className="ml-auto">
              {filteredAlerts.length} alerta{filteredAlerts.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Nenhum alerta encontrado</h3>
              <p className="text-gray-600">
                {typeFilter !== 'all' || statusFilter !== 'all' || searchQuery
                  ? 'Tente ajustar os filtros.'
                  : 'Tudo funcionando normalmente!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const typeConfig = TYPE_CONFIG[alert.type];
                const statusConfig = STATUS_CONFIG[alert.status];
                const TypeIcon = typeConfig.icon;

                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.type === 'critical' && alert.status !== 'resolved'
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${typeConfig.className}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge className={typeConfig.className}>{typeConfig.label}</Badge>
                          <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(alert.createdAt)}
                          </span>
                          <span>Fonte: {alert.source}</span>
                          {alert.acknowledgedBy && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Reconhecido por: {alert.acknowledgedBy}
                            </span>
                          )}
                        </div>
                        {alert.resolution && (
                          <div className="mt-3 p-2 bg-green-100 rounded text-sm">
                            <div className="flex items-center gap-1 text-green-800 font-medium">
                              <MessageSquare className="h-4 w-4" />
                              Resolucao:
                            </div>
                            <p className="text-green-700 mt-1">{alert.resolution}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {alert.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            Reconhecer
                          </Button>
                        )}
                        {alert.status !== 'resolved' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openResolveDialog(alert)}
                          >
                            Resolver
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Alerta</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold">{selectedAlert.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedAlert.message}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descricao da Resolucao</label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Descreva como o problema foi resolvido..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleResolve} disabled={!resolution.trim()}>
              Marcar como Resolvido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AlertsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <AlertsPageContent />
    </ProtectedRoute>
  );
}
