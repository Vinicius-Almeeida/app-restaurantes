'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { adminApi, type Plan, type CreatePlanInput, type UpdatePlanInput } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  RefreshCw,
  Plus,
  Edit,
  Check,
  X,
  Package,
  Users,
  Utensils,
  LayoutGrid,
} from 'lucide-react';
import { toast } from 'sonner';

interface PlanFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  billingPeriod: 'monthly' | 'yearly';
  features: string;
  maxTables: string;
  maxMenuItems: string;
  maxStaff: string;
  displayOrder: string;
}

const initialFormData: PlanFormData = {
  name: '',
  slug: '',
  description: '',
  price: '',
  billingPeriod: 'monthly',
  features: '',
  maxTables: '',
  maxMenuItems: '',
  maxStaff: '',
  displayOrder: '0',
};

function PlansPageContent() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.listPlans();
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => a.displayOrder - b.displayOrder
      );
      setPlans(sorted);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Erro ao carregar planos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const openCreateDialog = () => {
    setEditingPlan(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      price: plan.price.toString(),
      billingPeriod: plan.billingPeriod as 'monthly' | 'yearly',
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      maxTables: plan.maxTables.toString(),
      maxMenuItems: plan.maxMenuItems.toString(),
      maxStaff: plan.maxStaff.toString(),
      displayOrder: plan.displayOrder.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const features = formData.features
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      if (editingPlan) {
        const updateData: UpdatePlanInput = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          features,
          maxTables: parseInt(formData.maxTables, 10),
          maxMenuItems: parseInt(formData.maxMenuItems, 10),
          maxStaff: parseInt(formData.maxStaff, 10),
          displayOrder: parseInt(formData.displayOrder, 10),
        };
        await adminApi.updatePlan(editingPlan.id, updateData);
        toast.success('Plano atualizado com sucesso');
      } else {
        const createData: CreatePlanInput = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          price: parseFloat(formData.price),
          billingPeriod: formData.billingPeriod,
          features,
          maxTables: parseInt(formData.maxTables, 10),
          maxMenuItems: parseInt(formData.maxMenuItems, 10),
          maxStaff: parseInt(formData.maxStaff, 10),
          displayOrder: parseInt(formData.displayOrder, 10),
        };
        await adminApi.createPlan(createData);
        toast.success('Plano criado com sucesso');
      }

      setIsDialogOpen(false);
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error(editingPlan ? 'Erro ao atualizar plano' : 'Erro ao criar plano');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePlanStatus = async (plan: Plan) => {
    try {
      await adminApi.updatePlan(plan.id, { isActive: !plan.isActive });
      toast.success(`Plano ${plan.isActive ? 'desativado' : 'ativado'} com sucesso`);
      fetchPlans();
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast.error('Erro ao alterar status do plano');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-orange-600" />
          <p className="mt-4 text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planos</h1>
          <p className="text-gray-600">Gerencie os planos de assinatura da plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPlans}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Planos</p>
                <p className="text-2xl font-bold">{plans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Planos Ativos</p>
                <p className="text-2xl font-bold">
                  {plans.filter((p) => p.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Planos Inativos</p>
                <p className="text-2xl font-bold">
                  {plans.filter((p) => !p.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Nenhum plano encontrado</h3>
            <p className="text-gray-600 mb-4">Crie seu primeiro plano de assinatura.</p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Plano
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${!plan.isActive ? 'opacity-60' : ''}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                    {plan.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-orange-600">
                  {formatCurrency(plan.price)}
                  <span className="text-sm font-normal text-gray-500">
                    /{plan.billingPeriod === 'monthly' ? 'mes' : 'ano'}
                  </span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{plan.description}</p>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Limites:</p>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <LayoutGrid className="h-4 w-4 mx-auto mb-1 text-gray-500" />
                      <p className="font-bold">{plan.maxTables}</p>
                      <p className="text-xs text-gray-500">Mesas</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <Utensils className="h-4 w-4 mx-auto mb-1 text-gray-500" />
                      <p className="font-bold">{plan.maxMenuItems}</p>
                      <p className="text-xs text-gray-500">Itens</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <Users className="h-4 w-4 mx-auto mb-1 text-gray-500" />
                      <p className="font-bold">{plan.maxStaff}</p>
                      <p className="text-xs text-gray-500">Staff</p>
                    </div>
                  </div>
                </div>

                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Features:</p>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-sm text-gray-500">
                          +{plan.features.length - 4} mais...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(plan)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant={plan.isActive ? 'destructive' : 'default'}
                    size="sm"
                    className="flex-1"
                    onClick={() => togglePlanStatus(plan)}
                  >
                    {plan.isActive ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Ativar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Editar Plano' : 'Novo Plano'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Plano Pro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="Ex: pro"
                  disabled={!!editingPlan}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva o plano..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preco (R$)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="99.90"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingPeriod">Periodo</Label>
                <Select
                  value={formData.billingPeriod}
                  onValueChange={(value: 'monthly' | 'yearly') =>
                    setFormData((prev) => ({ ...prev, billingPeriod: value }))
                  }
                  disabled={!!editingPlan}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxTables">Max Mesas</Label>
                <Input
                  id="maxTables"
                  name="maxTables"
                  type="number"
                  min="1"
                  value={formData.maxTables}
                  onChange={handleInputChange}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxMenuItems">Max Itens</Label>
                <Input
                  id="maxMenuItems"
                  name="maxMenuItems"
                  type="number"
                  min="1"
                  value={formData.maxMenuItems}
                  onChange={handleInputChange}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStaff">Max Staff</Label>
                <Input
                  id="maxStaff"
                  name="maxStaff"
                  type="number"
                  min="1"
                  value={formData.maxStaff}
                  onChange={handleInputChange}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (uma por linha)</Label>
              <Textarea
                id="features"
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                placeholder="Pedidos ilimitados&#10;Relatorios avancados&#10;Suporte prioritario"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder">Ordem de exibicao</Label>
              <Input
                id="displayOrder"
                name="displayOrder"
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : editingPlan ? (
                'Atualizar'
              ) : (
                'Criar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PlansPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <PlansPageContent />
    </ProtectedRoute>
  );
}
