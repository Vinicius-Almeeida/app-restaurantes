'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Mail,
  Globe,
  Percent,
  Save,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface PlatformSettings {
  platformName: string;
  platformEmail: string;
  supportEmail: string;
  defaultCurrency: string;
  defaultLanguage: string;
  platformFeePercent: number;
  trialDays: number;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  requireEmailVerification: boolean;
  maxRestaurantsPerOwner: number;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  emailFromName: string;
  emailFromAddress: string;
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  notifyOnNewRestaurant: boolean;
  notifyOnNewSubscription: boolean;
  notifyOnPaymentFailed: boolean;
  minPasswordLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
}

const defaultSettings: PlatformSettings = {
  platformName: 'TabSync',
  platformEmail: 'contato@tabsync.com',
  supportEmail: 'suporte@tabsync.com',
  defaultCurrency: 'BRL',
  defaultLanguage: 'pt-BR',
  platformFeePercent: 2.5,
  trialDays: 14,
  maintenanceMode: false,
  allowNewRegistrations: true,
  requireEmailVerification: true,
  maxRestaurantsPerOwner: 5,
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPassword: '',
  emailFromName: 'TabSync',
  emailFromAddress: 'noreply@tabsync.com',
  enablePushNotifications: true,
  enableEmailNotifications: true,
  enableSmsNotifications: false,
  notifyOnNewRestaurant: true,
  notifyOnNewSubscription: true,
  notifyOnPaymentFailed: true,
  minPasswordLength: 8,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  sessionTimeoutMinutes: 60,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
};

function SettingsPageContent() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSwitchChange = (name: keyof PlatformSettings, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Simulando chamada de API - em producao, usar endpoint real
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Configuracoes salvas com sucesso');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configuracoes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuracoes</h1>
          <p className="text-gray-600">Gerencie as configuracoes da plataforma</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alteracoes
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificacoes
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Seguranca
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informacoes da Plataforma
                </CardTitle>
                <CardDescription>
                  Configuracoes basicas da plataforma TabSync
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Nome da Plataforma</Label>
                    <Input
                      id="platformName"
                      name="platformName"
                      value={settings.platformName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platformEmail">Email da Plataforma</Label>
                    <Input
                      id="platformEmail"
                      name="platformEmail"
                      type="email"
                      value={settings.platformEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Email de Suporte</Label>
                    <Input
                      id="supportEmail"
                      name="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxRestaurantsPerOwner">Max Restaurantes por Owner</Label>
                    <Input
                      id="maxRestaurantsPerOwner"
                      name="maxRestaurantsPerOwner"
                      type="number"
                      min="1"
                      value={settings.maxRestaurantsPerOwner}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Moeda Padrao</Label>
                    <Select
                      value={settings.defaultCurrency}
                      onValueChange={(value) =>
                        setSettings((prev) => ({ ...prev, defaultCurrency: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">BRL - Real Brasileiro</SelectItem>
                        <SelectItem value="USD">USD - Dolar Americano</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultLanguage">Idioma Padrao</Label>
                    <Select
                      value={settings.defaultLanguage}
                      onValueChange={(value) =>
                        setSettings((prev) => ({ ...prev, defaultLanguage: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Portugues (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es">Espanol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Opcoes do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo Manutencao</Label>
                    <p className="text-sm text-gray-500">
                      Desativa o acesso a plataforma para usuarios
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      handleSwitchChange('maintenanceMode', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Permitir Novos Cadastros</Label>
                    <p className="text-sm text-gray-500">
                      Permite que novos usuarios se cadastrem
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowNewRegistrations}
                    onCheckedChange={(checked) =>
                      handleSwitchChange('allowNewRegistrations', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verificacao de Email Obrigatoria</Label>
                    <p className="text-sm text-gray-500">
                      Usuarios precisam verificar email para acessar
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      handleSwitchChange('requireEmailVerification', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Configuracoes de Billing
              </CardTitle>
              <CardDescription>
                Configuracoes de cobranca e taxas da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformFeePercent">Taxa da Plataforma (%)</Label>
                  <div className="relative">
                    <Input
                      id="platformFeePercent"
                      name="platformFeePercent"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={settings.platformFeePercent}
                      onChange={handleInputChange}
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">
                    Porcentagem cobrada sobre cada transacao
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trialDays">Dias de Trial</Label>
                  <Input
                    id="trialDays"
                    name="trialDays"
                    type="number"
                    min="0"
                    value={settings.trialDays}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-gray-500">
                    Periodo de teste gratuito para novos restaurantes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuracoes de Email
              </CardTitle>
              <CardDescription>
                Configuracoes do servidor SMTP para envio de emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">Servidor SMTP</Label>
                  <Input
                    id="smtpHost"
                    name="smtpHost"
                    value={settings.smtpHost}
                    onChange={handleInputChange}
                    placeholder="smtp.exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Porta</Label>
                  <Input
                    id="smtpPort"
                    name="smtpPort"
                    value={settings.smtpPort}
                    onChange={handleInputChange}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">Usuario SMTP</Label>
                  <Input
                    id="smtpUser"
                    name="smtpUser"
                    value={settings.smtpUser}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">Senha SMTP</Label>
                  <Input
                    id="smtpPassword"
                    name="smtpPassword"
                    type="password"
                    value={settings.smtpPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailFromName">Nome do Remetente</Label>
                  <Input
                    id="emailFromName"
                    name="emailFromName"
                    value={settings.emailFromName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailFromAddress">Email do Remetente</Label>
                  <Input
                    id="emailFromAddress"
                    name="emailFromAddress"
                    type="email"
                    value={settings.emailFromAddress}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuracoes de Notificacoes
              </CardTitle>
              <CardDescription>
                Gerencie como e quando notificacoes sao enviadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-4">Canais de Notificacao</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificacoes Push</Label>
                      <p className="text-sm text-gray-500">
                        Notificacoes no navegador/app
                      </p>
                    </div>
                    <Switch
                      checked={settings.enablePushNotifications}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('enablePushNotifications', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificacoes por Email</Label>
                      <p className="text-sm text-gray-500">
                        Enviar emails para eventos importantes
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableEmailNotifications}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('enableEmailNotifications', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificacoes SMS</Label>
                      <p className="text-sm text-gray-500">
                        Enviar SMS para alertas criticos
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableSmsNotifications}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('enableSmsNotifications', checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-sm font-semibold mb-4">Eventos para Notificar Admin</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Novo Restaurante Cadastrado</Label>
                    </div>
                    <Switch
                      checked={settings.notifyOnNewRestaurant}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('notifyOnNewRestaurant', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Nova Assinatura</Label>
                    </div>
                    <Switch
                      checked={settings.notifyOnNewSubscription}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('notifyOnNewSubscription', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Pagamento Falhou</Label>
                    </div>
                    <Switch
                      checked={settings.notifyOnPaymentFailed}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('notifyOnPaymentFailed', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Politica de Senhas
                </CardTitle>
                <CardDescription>
                  Configure os requisitos de seguranca para senhas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPasswordLength">Tamanho Minimo</Label>
                    <Input
                      id="minPasswordLength"
                      name="minPasswordLength"
                      type="number"
                      min="6"
                      max="32"
                      value={settings.minPasswordLength}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Exigir Letras Maiusculas</Label>
                    </div>
                    <Switch
                      checked={settings.requireUppercase}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('requireUppercase', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Exigir Numeros</Label>
                    </div>
                    <Switch
                      checked={settings.requireNumbers}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('requireNumbers', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Exigir Caracteres Especiais</Label>
                    </div>
                    <Switch
                      checked={settings.requireSpecialChars}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('requireSpecialChars', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Controle de Sessao</CardTitle>
                <CardDescription>
                  Configure timeout e tentativas de login
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeoutMinutes">Timeout de Sessao (min)</Label>
                    <Input
                      id="sessionTimeoutMinutes"
                      name="sessionTimeoutMinutes"
                      type="number"
                      min="5"
                      value={settings.sessionTimeoutMinutes}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Tentativas de Login</Label>
                    <Input
                      id="maxLoginAttempts"
                      name="maxLoginAttempts"
                      type="number"
                      min="3"
                      value={settings.maxLoginAttempts}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lockoutDurationMinutes">Duracao Bloqueio (min)</Label>
                    <Input
                      id="lockoutDurationMinutes"
                      name="lockoutDurationMinutes"
                      type="number"
                      min="5"
                      value={settings.lockoutDurationMinutes}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <SettingsPageContent />
    </ProtectedRoute>
  );
}
