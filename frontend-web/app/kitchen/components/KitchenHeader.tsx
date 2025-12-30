/**
 * Kitchen Header Component
 * Top navigation with status and controls
 */

'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff, Wifi, ChefHat } from 'lucide-react';

interface KitchenHeaderProps {
  restaurantName?: string;
  isConnected: boolean;
  isReconnecting: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function KitchenHeader({
  restaurantName = 'Cozinha',
  isConnected,
  isReconnecting,
  onRefresh,
  isRefreshing = false,
}: KitchenHeaderProps) {
  return (
    <header className="bg-white border-b-2 border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg p-2">
                <ChefHat className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard da Cozinha
                </h1>
                <p className="text-sm text-muted-foreground">
                  {restaurantName}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isReconnecting ? (
                <>
                  <WifiOff className="size-5 text-orange-500 animate-pulse" />
                  <span className="text-sm font-medium text-orange-600">
                    Reconectando...
                  </span>
                </>
              ) : isConnected ? (
                <>
                  <Wifi className="size-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    Conectado
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="size-5 text-red-500" />
                  <span className="text-sm font-medium text-red-600">
                    Desconectado
                  </span>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
