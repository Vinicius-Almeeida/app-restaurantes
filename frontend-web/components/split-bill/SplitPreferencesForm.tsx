/**
 * Split Preferences Form Component
 * Allows users to configure their split preferences
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Settings2, Brain, CreditCard, Loader2 } from 'lucide-react';
import {
  getSplitPreferences,
  updateSplitPreferences,
  type SplitPreferences,
  type SplitMethod,
  type PaymentMethod,
} from '@/lib/api/smart-split';

const SPLIT_METHOD_OPTIONS: Array<{ value: SplitMethod; label: string }> = [
  { value: 'EQUAL', label: 'Dividir Igualmente' },
  { value: 'BY_ITEM', label: 'Por Item' },
  { value: 'CUSTOM', label: 'Customizado' },
  { value: 'PERCENTAGE', label: 'Por Porcentagem' },
];

const PAYMENT_METHOD_OPTIONS: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'PIX', label: 'PIX' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
  { value: 'CASH', label: 'Dinheiro' },
];

interface SplitPreferencesFormProps {
  onSave?: () => void;
}

export function SplitPreferencesForm({ onSave }: SplitPreferencesFormProps) {
  const [preferences, setPreferences] = useState<SplitPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [preferredSplitMethod, setPreferredSplitMethod] = useState<SplitMethod>('EQUAL');
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<PaymentMethod | ''>('');
  const [autoSuggestEnabled, setAutoSuggestEnabled] = useState(true);
  const [learnFromHistory, setLearnFromHistory] = useState(true);

  useEffect(() => {
    async function fetchPreferences() {
      try {
        setLoading(true);
        const data = await getSplitPreferences();
        setPreferences(data);

        // Update form state
        setPreferredSplitMethod(data.preferredSplitMethod);
        setPreferredPaymentMethod(data.preferredPaymentMethod || '');
        setAutoSuggestEnabled(data.autoSuggestEnabled);
        setLearnFromHistory(data.learnFromHistory);
      } catch (err) {
        console.error('[SplitPreferences] Failed to fetch:', err);
        // Initialize with defaults if fetch fails
      } finally {
        setLoading(false);
      }
    }

    fetchPreferences();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      const updates = {
        preferredSplitMethod,
        autoSuggestEnabled,
        learnFromHistory,
        ...(preferredPaymentMethod && { preferredPaymentMethod: preferredPaymentMethod as PaymentMethod }),
      };

      const updated = await updateSplitPreferences(updates);
      setPreferences(updated);

      toast.success('Preferências salvas', {
        description: 'Suas preferências de divisão foram atualizadas',
      });

      onSave?.();
    } catch (err) {
      console.error('[SplitPreferences] Failed to save:', err);
      toast.error('Erro ao salvar', {
        description: 'Não foi possível salvar suas preferências',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-orange-600" />
          <CardTitle>Preferências de Divisão</CardTitle>
        </div>
        <CardDescription>
          Configure como você prefere dividir suas contas
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Preferred Split Method */}
        <div className="space-y-2">
          <Label htmlFor="split-method">Método Preferido de Divisão</Label>
          <Select
            value={preferredSplitMethod}
            onValueChange={(value) => setPreferredSplitMethod(value as SplitMethod)}
          >
            <SelectTrigger id="split-method">
              <SelectValue placeholder="Selecione um método" />
            </SelectTrigger>
            <SelectContent>
              {SPLIT_METHOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">
            Este método será usado como padrão quando você iniciar uma divisão
          </p>
        </div>

        {/* Preferred Payment Method */}
        <div className="space-y-2">
          <Label htmlFor="payment-method">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Método de Pagamento Preferido</span>
            </div>
          </Label>
          <Select
            value={preferredPaymentMethod}
            onValueChange={(value) => setPreferredPaymentMethod(value as PaymentMethod)}
          >
            <SelectTrigger id="payment-method">
              <SelectValue placeholder="Selecione (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Auto Suggest Toggle */}
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-full mt-0.5">
              <Brain className="h-4 w-4 text-purple-600" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="auto-suggest" className="text-base font-medium">
                Sugestões Inteligentes
              </Label>
              <p className="text-sm text-gray-600">
                Receba recomendações baseadas em IA para dividir a conta
              </p>
            </div>
          </div>
          <Switch
            id="auto-suggest"
            checked={autoSuggestEnabled}
            onCheckedChange={setAutoSuggestEnabled}
          />
        </div>

        {/* Learn from History Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="learn-history" className="text-base font-medium">
              Aprender com Histórico
            </Label>
            <p className="text-sm text-gray-600">
              Melhorar sugestões com base nas suas escolhas anteriores
            </p>
          </div>
          <Switch
            id="learn-history"
            checked={learnFromHistory}
            onCheckedChange={setLearnFromHistory}
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Preferências'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
