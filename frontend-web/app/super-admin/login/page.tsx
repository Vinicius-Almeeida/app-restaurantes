'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShieldCheck, Lock, Mail } from 'lucide-react';

const superAdminLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .refine((email) => {
      const adminDomains = ['@tabsync.com', '@admin.tabsync.com'];
      return adminDomains.some((domain) => email.endsWith(domain));
    }, 'Apenas domínios administrativos são permitidos'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter no mínimo 8 caracteres'),
  twoFactorCode: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{6}$/.test(val), 'Código deve ter 6 dígitos'),
});

type SuperAdminLoginFormData = z.infer<typeof superAdminLoginSchema>;

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SuperAdminLoginFormData>({
    resolver: zodResolver(superAdminLoginSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: SuperAdminLoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);

      const currentUser = useAuthStore.getState().user;

      // Validate SUPER_ADMIN or CONSULTANT role
      if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'CONSULTANT')) {
        useAuthStore.getState().logout();
        toast.error('Acesso negado. Credenciais de administrador inválidas.');
        return;
      }

      // 2FA validation placeholder
      if (data.twoFactorCode && data.twoFactorCode !== '000000') {
        // TODO: Implement actual 2FA verification
        toast.error('Código 2FA inválido');
        return;
      }

      toast.success('Login administrativo realizado com sucesso');
      router.push('/super-admin/dashboard');
    } catch (error: unknown) {
      console.error('Super Admin login error:', error);
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Erro ao fazer login. Verifique suas credenciais.';
      toast.error(errorMessage || 'Acesso negado. Credenciais inválidas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />

      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-2xl relative z-10">
        <CardHeader className="space-y-3 pb-8">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
              <ShieldCheck className="w-12 h-12 text-blue-400" strokeWidth={1.5} />
            </div>
          </div>

          <CardTitle className="text-3xl font-bold text-center text-white tracking-tight">
            TabSync Admin
          </CardTitle>

          <CardDescription className="text-center text-slate-400 text-sm">
            Acesso restrito para administradores do sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200 text-sm font-medium">
                Email Administrativo
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@tabsync.com"
                  {...register('email')}
                  disabled={isLoading}
                  className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200 text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isLoading}
                  className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {show2FA && (
              <div className="space-y-2">
                <Label htmlFor="twoFactorCode" className="text-slate-200 text-sm font-medium">
                  Código 2FA (Opcional)
                </Label>
                <Input
                  id="twoFactorCode"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  {...register('twoFactorCode')}
                  disabled={isLoading}
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 text-center tracking-widest text-lg font-mono"
                />
                {errors.twoFactorCode && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    {errors.twoFactorCode.message}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShow2FA(!show2FA)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {show2FA ? 'Ocultar' : 'Ativar'} autenticação 2FA
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando credenciais...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Acessar Painel Admin
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-center text-slate-500">
              Acesso monitorado e registrado para fins de auditoria
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
