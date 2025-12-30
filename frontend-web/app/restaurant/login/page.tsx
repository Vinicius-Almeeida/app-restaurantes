'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ChefHat, Mail, Lock, HelpCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória').min(6, 'Senha deve ter no mínimo 6 caracteres'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function RestaurantLoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberStaff', 'true');
      } else {
        localStorage.removeItem('rememberStaff');
      }

      // Verify user role is staff
      const currentUser = useAuthStore.getState().user;
      const validStaffRoles = ['RESTAURANT_OWNER', 'WAITER', 'KITCHEN'];

      if (!currentUser || !validStaffRoles.includes(currentUser.role)) {
        toast.error('Acesso negado. Esta área é restrita para equipe de restaurante.');
        useAuthStore.getState().logout();
        return;
      }

      toast.success('Login realizado com sucesso!');

      // Redirect based on role
      if (currentUser.role === 'RESTAURANT_OWNER') {
        router.push('/dashboard');
      } else if (currentUser.role === 'WAITER') {
        router.push('/dashboard/orders');
      } else if (currentUser.role === 'KITCHEN') {
        router.push('/dashboard/orders');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-9 h-9 text-white" strokeWidth={2} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-slate-800">
            Acesso Restaurante
          </CardTitle>
          <CardDescription className="text-center text-slate-600">
            Área exclusiva para equipe do restaurante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email Corporativo
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@restaurante.com"
                  className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  {...register('email')}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  {...register('password')}
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                disabled={isLoading}
                className="border-slate-300"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-slate-600 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Lembrar minhas credenciais
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar no Painel'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <div className="w-full pt-4 border-t border-slate-200">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span>
                Precisa de acesso?{' '}
                <a
                  href="mailto:suporte@tabsync.com"
                  className="text-blue-600 hover:text-blue-700 font-semibold underline decoration-blue-600/30 hover:decoration-blue-700"
                >
                  Contate o suporte
                </a>
              </span>
            </div>
          </div>

          <div className="text-sm text-center">
            <Link href="/" className="text-slate-600 hover:text-slate-800 font-medium transition-colors">
              ← Voltar para área pública
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
