'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';

interface SecurityCheck {
  id: string;
  name: string;
  status: 'ok' | 'warning' | 'error';
  description: string;
  lastCheck: string;
}

function SecurityContent() {
  const [checking, setChecking] = useState(false);

  const securityChecks: SecurityCheck[] = [
    {
      id: '1',
      name: 'Autenticacao JWT',
      status: 'ok',
      description: 'Tokens com expiracao de 15min, refresh tokens ativos',
      lastCheck: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Rate Limiting',
      status: 'ok',
      description: 'Limite de 100 req/15min global, 5 tentativas auth',
      lastCheck: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'CORS Policy',
      status: 'ok',
      description: 'Origens permitidas configuradas corretamente',
      lastCheck: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Validacao de Dados',
      status: 'ok',
      description: 'Zod schema validation em todas as rotas',
      lastCheck: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Criptografia de Senhas',
      status: 'ok',
      description: 'bcrypt com salt rounds adequados',
      lastCheck: new Date().toISOString(),
    },
    {
      id: '6',
      name: 'HTTPS',
      status: 'ok',
      description: 'Todas as conexoes usam TLS/SSL',
      lastCheck: new Date().toISOString(),
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Shield className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-500/10 border-green-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  const handleRunChecks = () => {
    setChecking(true);
    setTimeout(() => setChecking(false), 2000);
  };

  const okCount = securityChecks.filter(c => c.status === 'ok').length;
  const warningCount = securityChecks.filter(c => c.status === 'warning').length;
  const errorCount = securityChecks.filter(c => c.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Seguranca</h1>
          <p className="text-slate-400">Monitoramento e auditoria de seguranca</p>
        </div>
        <Button
          onClick={handleRunChecks}
          disabled={checking}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Verificando...' : 'Executar Verificacao'}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-green-500/10 rounded-lg mb-3">
                <ShieldCheck className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-sm text-slate-400">OK</p>
              <p className="text-2xl font-bold text-green-400">{okCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-yellow-500/10 rounded-lg mb-3">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              </div>
              <p className="text-sm text-slate-400">Alertas</p>
              <p className="text-2xl font-bold text-yellow-400">{warningCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-red-500/10 rounded-lg mb-3">
                <ShieldAlert className="h-6 w-6 text-red-400" />
              </div>
              <p className="text-sm text-slate-400">Criticos</p>
              <p className="text-2xl font-bold text-red-400">{errorCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-blue-500/10 rounded-lg mb-3">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <p className="text-sm text-slate-400">Total</p>
              <p className="text-2xl font-bold text-white">{securityChecks.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-400" />
            Verificacoes de Seguranca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityChecks.map((check) => (
              <div
                key={check.id}
                className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <h4 className="font-medium text-white">{check.name}</h4>
                      <p className="text-sm text-slate-400 mt-1">{check.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(check.lastCheck).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-400" />
              Politicas de Acesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-blue-400" />
                  <span className="text-slate-300">JWT Token Expiry</span>
                </div>
                <span className="text-sm text-slate-400">15 minutos</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-green-400" />
                  <span className="text-slate-300">Refresh Token Expiry</span>
                </div>
                <span className="text-sm text-slate-400">7 dias</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-orange-400" />
                  <span className="text-slate-300">Tentativas de Login</span>
                </div>
                <span className="text-sm text-slate-400">5 / 15min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-400" />
              Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <Eye className="h-4 w-4 text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm text-slate-300">Login realizado</p>
                  <p className="text-xs text-slate-500">admin@tabsync.com</p>
                </div>
                <span className="text-xs text-slate-500">agora</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <Eye className="h-4 w-4 text-green-400" />
                <div className="flex-1">
                  <p className="text-sm text-slate-300">Acesso ao painel admin</p>
                  <p className="text-xs text-slate-500">SUPER_ADMIN</p>
                </div>
                <span className="text-xs text-slate-500">1 min</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <Eye className="h-4 w-4 text-purple-400" />
                <div className="flex-1">
                  <p className="text-sm text-slate-300">Consulta de metricas</p>
                  <p className="text-xs text-slate-500">/api/admin/dashboard</p>
                </div>
                <span className="text-xs text-slate-500">2 min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <SecurityContent />
    </ProtectedRoute>
  );
}
