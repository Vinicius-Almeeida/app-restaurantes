/**
 * Review Form Component
 * Form for submitting customer reviews with ratings
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RatingStars } from './RatingStars';
import { toast } from 'sonner';

const reviewSchema = z.object({
  orderId: z.string().min(1, 'ID do pedido é obrigatório'),
  overallRating: z.number().min(1, 'Avaliação geral é obrigatória').max(5),
  foodRating: z.number().min(0).max(5).optional(),
  serviceRating: z.number().min(0).max(5).optional(),
  ambianceRating: z.number().min(0).max(5).optional(),
  waitTimeRating: z.number().min(0).max(5).optional(),
  valueRating: z.number().min(0).max(5).optional(),
  comment: z.string().max(1000, 'Comentário muito longo (máximo 1000 caracteres)').optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  orderId: string;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const categories = [
  { key: 'foodRating' as const, label: 'Comida', icon: '🍽️' },
  { key: 'serviceRating' as const, label: 'Atendimento', icon: '👨‍🍳' },
  { key: 'ambianceRating' as const, label: 'Ambiente', icon: '🏠' },
  { key: 'waitTimeRating' as const, label: 'Tempo de espera', icon: '⏱️' },
  { key: 'valueRating' as const, label: 'Custo-benefício', icon: '💰' },
];

export function ReviewForm({ orderId, onSubmit, onSuccess, onCancel }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      orderId,
      overallRating: 0,
      foodRating: 0,
      serviceRating: 0,
      ambianceRating: 0,
      waitTimeRating: 0,
      valueRating: 0,
      comment: '',
    },
  });

  const handleSubmit = async (data: ReviewFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      toast.success('Avaliação enviada com sucesso!');
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="overallRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Avaliação Geral *
              </FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <RatingStars
                    value={field.value}
                    onChange={field.onChange}
                    size="lg"
                    showValue
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <Label className="text-sm font-medium text-muted-foreground">
            Avaliações por categoria (opcional)
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map(({ key, label, icon }) => (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm flex items-center gap-2">
                      <span>{icon}</span>
                      {label}
                    </FormLabel>
                    <FormControl>
                      <RatingStars
                        value={field.value || 0}
                        onChange={field.onChange}
                        size="md"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentário (opcional)</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={4}
                  placeholder="Conte-nos mais sobre sua experiência..."
                  className="w-full px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={1000}
                />
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground">
                <FormMessage />
                <span>{field.value?.length || 0}/1000</span>
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Star className="size-4" />
                Enviar Avaliação
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
