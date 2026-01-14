'use client';

/**
 * Consultant Onboarding Page
 * FAANG-level enterprise page for consultants to onboard new restaurants.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  User,
  Mail,
  Phone,
  FileText,
  Link as LinkIcon,
  CheckCircle,
  Copy,
  ArrowLeft,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { consultantApi, type OnboardRestaurantInput, type OnboardRestaurantResult } from '@/lib/api/consultant';

function OnboardingContent() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<OnboardRestaurantResult | null>(null);

  const [formData, setFormData] = useState<OnboardRestaurantInput>({
    name: '',
    slug: '',
    description: '',
    phone: '',
    email: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
  });

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleChange = (field: keyof OnboardRestaurantInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug || !formData.ownerName || !formData.ownerEmail) {
      toast.error('Preencha todos os campos obrigatorios');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await consultantApi.onboardRestaurant(formData);
      setResult(response);
      toast.success('Restaurante criado com sucesso!');
    } catch (error: unknown) {
      console.error('Error onboarding restaurant:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Erro ao criar restaurante');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  // Success state
  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/super-admin/restaurants')}
          className="gap-2 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Restaurantes
        </Button>

        <Card className="bg-green-900/20 border-green-500/30">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-500/20 p-4 rounded-full w-fit mb-4">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
            <CardTitle className="text-2xl text-white">Restaurante Criado!</CardTitle>
            <CardDescription className="text-slate-300">
              O restaurante foi cadastrado com sucesso na plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Restaurant Info */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Store className="h-5 w-5 text-orange-400" />
                Dados do Restaurante
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Nome</p>
                  <p className="text-white font-medium">{result.restaurant.name}</p>
                </div>
                <div>
                  <p className="text-slate-400">Slug</p>
                  <p className="text-white font-medium">/{result.restaurant.slug}</p>
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <User className="h-5 w-5 text-blue-400" />
                Dados do Proprietario
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Nome</p>
                    <p className="text-white">{result.owner.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Email</p>
                    <p className="text-white">{result.owner.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.owner.email, 'Email')}
                    className="text-slate-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {result.owner.isNew && result.owner.tempPassword && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <p className="text-amber-400 text-sm font-medium mb-2">
                      Senha Temporaria (anote e envie ao proprietario)
                    </p>
                    <div className="flex items-center justify-between bg-slate-900 rounded px-3 py-2">
                      <code className="text-amber-300 font-mono">{result.owner.tempPassword}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.owner.tempPassword!, 'Senha')}
                        className="text-slate-400 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-slate-400 text-xs mt-2">
                      O proprietario deve alterar esta senha no primeiro acesso.
                    </p>
                  </div>
                )}
                {!result.owner.isNew && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-400 text-sm">
                      Este email ja estava cadastrado. O proprietario pode usar sua senha existente.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setResult(null);
                  setFormData({
                    name: '',
                    slug: '',
                    description: '',
                    phone: '',
                    email: '',
                    ownerName: '',
                    ownerEmail: '',
                    ownerPhone: '',
                  });
                }}
                variant="outline"
                className="flex-1"
              >
                Cadastrar Outro
              </Button>
              <Button
                onClick={() => router.push('/super-admin/restaurants')}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                Ver Meus Restaurantes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2 text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Novo Restaurante
        </h1>
        <p className="text-slate-400">
          Cadastre um novo restaurante na plataforma TabSync
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Restaurant Info */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Store className="h-5 w-5 text-orange-400" />
              Dados do Restaurante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Nome do Restaurante *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Boteco do Chef"
                className="bg-slate-900 border-slate-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-slate-300">
                Slug (URL) *
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">/</span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="boteco-do-chef"
                  className="bg-slate-900 border-slate-600 text-white"
                  required
                />
              </div>
              <p className="text-xs text-slate-500">
                URL do restaurante: tabsync.com/{formData.slug || 'slug'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">
                Descricao
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Uma breve descricao do restaurante..."
                className="bg-slate-900 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300">
                  Telefone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="bg-slate-900 border-slate-600 text-white pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contato@restaurante.com"
                    className="bg-slate-900 border-slate-600 text-white pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Info */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-blue-400" />
              Dados do Proprietario
            </CardTitle>
            <CardDescription className="text-slate-400">
              O proprietario recebera acesso ao painel do restaurante
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ownerName" className="text-slate-300">
                Nome Completo *
              </Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => handleChange('ownerName', e.target.value)}
                placeholder="Nome do proprietario"
                className="bg-slate-900 border-slate-600 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerEmail" className="text-slate-300">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => handleChange('ownerEmail', e.target.value)}
                    placeholder="dono@email.com"
                    className="bg-slate-900 border-slate-600 text-white pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerPhone" className="text-slate-300">
                  Telefone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={(e) => handleChange('ownerPhone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="bg-slate-900 border-slate-600 text-white pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Criando...
            </>
          ) : (
            'Cadastrar Restaurante'
          )}
        </Button>
      </form>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute allowedRoles={['CONSULTANT']}>
      <OnboardingContent />
    </ProtectedRoute>
  );
}
