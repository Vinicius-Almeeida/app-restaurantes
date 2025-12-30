'use client';

import { LoadingSpinner } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';

interface WaitingApprovalProps {
  ownerName: string;
  restaurantName: string;
  tableNumber: number;
}

export function WaitingApproval({
  ownerName,
  restaurantName,
  tableNumber,
}: WaitingApprovalProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <Clock className="h-16 w-16 text-orange-600" />
                <div className="absolute -bottom-1 -right-1">
                  <LoadingSpinner size="sm" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Aguardando Aprovacao
              </h1>
              <p className="text-gray-600">
                Sua solicitacao foi enviada ao responsavel da mesa
              </p>
            </div>

            {/* Table Info */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Restaurante:</span>
                <span className="font-medium text-gray-900">{restaurantName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mesa:</span>
                <Badge variant="outline">{tableNumber}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Responsavel:</span>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-gray-900">{ownerName}</span>
                </div>
              </div>
            </div>

            {/* Status Message */}
            <div className="text-sm text-gray-500 space-y-2">
              <p>O responsavel da mesa precisa aprovar sua entrada.</p>
              <p>Isso geralmente leva apenas alguns segundos.</p>
            </div>

            {/* Animated dots */}
            <div className="flex justify-center gap-2">
              <div className="h-2 w-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
