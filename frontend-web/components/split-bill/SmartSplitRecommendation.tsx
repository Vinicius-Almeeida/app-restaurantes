/**
 * SmartSplit Recommendation Component
 * Shows AI-powered split recommendation with confidence indicator
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Brain, Lightbulb, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getSplitRecommendation,
  type SplitRecommendation,
  type SplitMethod,
} from '@/lib/api/smart-split';

interface SmartSplitRecommendationProps {
  orderId: string;
  participantUserIds: string[];
  currentMethod: SplitMethod;
  onSelectMethod: (method: SplitMethod, confidence: number) => void;
  disabled?: boolean;
}

const METHOD_LABELS: Record<SplitMethod, { label: string; icon: string }> = {
  EQUAL: { label: 'Dividir Igualmente', icon: '⚖️' },
  BY_ITEM: { label: 'Por Item', icon: '🍽️' },
  CUSTOM: { label: 'Customizado', icon: '✏️' },
  PERCENTAGE: { label: 'Por Porcentagem', icon: '📊' },
};

const CONFIDENCE_COLORS = {
  high: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-gray-100 text-gray-800 border-gray-300',
};

function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 70) return 'high';
  if (confidence >= 40) return 'medium';
  return 'low';
}

export function SmartSplitRecommendation({
  orderId,
  participantUserIds,
  currentMethod,
  onSelectMethod,
  disabled = false,
}: SmartSplitRecommendationProps) {
  const [recommendation, setRecommendation] = useState<SplitRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  useEffect(() => {
    async function fetchRecommendation() {
      if (!orderId || participantUserIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getSplitRecommendation(orderId, participantUserIds);
        setRecommendation(data);
      } catch (err) {
        console.error('[SmartSplit] Failed to get recommendation:', err);
        setError('Não foi possível obter recomendação');
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendation();
  }, [orderId, participantUserIds]);

  const handleAcceptRecommendation = () => {
    if (!recommendation) return;
    onSelectMethod(recommendation.method, recommendation.confidence);
    toast.success('Sugestão aplicada', {
      description: `Método "${METHOD_LABELS[recommendation.method].label}" selecionado`,
    });
  };

  const handleSelectAlternative = (method: SplitMethod, confidence: number) => {
    onSelectMethod(method, confidence);
    toast.info('Método alternativo selecionado', {
      description: `Método "${METHOD_LABELS[method].label}" selecionado`,
    });
  };

  if (loading) {
    return (
      <Card className="border-2 border-dashed border-purple-200 bg-purple-50/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error || !recommendation) {
    return null; // Don't show anything if recommendation fails
  }

  const confidenceLevel = getConfidenceLevel(recommendation.confidence);
  const isCurrentMethodRecommended = currentMethod === recommendation.method;

  return (
    <Card className={cn(
      'border-2 transition-all',
      isCurrentMethodRecommended
        ? 'border-purple-500 bg-purple-50'
        : 'border-purple-200 bg-purple-50/50 hover:border-purple-300'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 rounded-full">
              <Brain className="h-4 w-4 text-purple-600" />
            </div>
            <CardTitle className="text-sm font-semibold text-purple-900">
              Sugestão Inteligente
            </CardTitle>
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <Badge
            variant="outline"
            className={cn('text-xs', CONFIDENCE_COLORS[confidenceLevel])}
          >
            {recommendation.confidence}% confiança
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Main Recommendation */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {METHOD_LABELS[recommendation.method].icon}
            </span>
            <div>
              <p className="font-semibold text-gray-900">
                {METHOD_LABELS[recommendation.method].label}
              </p>
              <p className="text-sm text-gray-600">{recommendation.reason}</p>
            </div>
          </div>

          {!isCurrentMethodRecommended && (
            <Button
              size="sm"
              onClick={handleAcceptRecommendation}
              disabled={disabled}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Aplicar
            </Button>
          )}

          {isCurrentMethodRecommended && (
            <Badge className="bg-purple-600">Selecionado</Badge>
          )}
        </div>

        {/* Alternatives Toggle */}
        {recommendation.alternativeMethods.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 transition-colors"
          >
            <Lightbulb className="h-4 w-4" />
            <span>
              {showAlternatives ? 'Ocultar' : 'Ver'} outras opções
            </span>
            {showAlternatives ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Alternative Methods */}
        {showAlternatives && recommendation.alternativeMethods.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-purple-100">
            {recommendation.alternativeMethods.map((alt) => (
              <div
                key={alt.method}
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg border transition-colors',
                  currentMethod === alt.method
                    ? 'bg-purple-100 border-purple-300'
                    : 'bg-white border-gray-200 hover:border-purple-200'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{METHOD_LABELS[alt.method].icon}</span>
                  <div>
                    <p className="text-sm font-medium">
                      {METHOD_LABELS[alt.method].label}
                    </p>
                    <p className="text-xs text-gray-500">{alt.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      CONFIDENCE_COLORS[getConfidenceLevel(alt.confidence)]
                    )}
                  >
                    {alt.confidence}%
                  </Badge>

                  {currentMethod !== alt.method && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAlternative(alt.method, alt.confidence)}
                      disabled={disabled}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      Usar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
