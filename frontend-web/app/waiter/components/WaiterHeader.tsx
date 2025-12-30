/**
 * Waiter Header Component
 * Top navigation with notifications and status
 */

'use client';

import { Bell, LogOut, RefreshCw, Wifi, WifiOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface WaiterHeaderProps {
  restaurantName: string;
  waiterName: string;
  notificationCount: number;
  isConnected: boolean;
  isReconnecting: boolean;
  onLogout: () => void;
  onRefresh: () => void;
  onNotificationsClick: () => void;
  isRefreshing?: boolean;
}

export function WaiterHeader({
  restaurantName,
  waiterName,
  notificationCount,
  isConnected,
  isReconnecting,
  onLogout,
  onRefresh,
  onNotificationsClick,
  isRefreshing = false,
}: WaiterHeaderProps): JSX.Element {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold truncate max-w-[200px]">{restaurantName}</h1>
            <p className="text-xs text-muted-foreground">Olá, {waiterName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2">
            {isReconnecting ? (
              <>
                <WifiOff className="size-4 text-orange-500 animate-pulse" />
                <span className="text-xs text-orange-600 hidden sm:inline">Reconectando...</span>
              </>
            ) : isConnected ? (
              <>
                <Wifi className="size-4 text-green-500" />
                <span className="text-xs text-green-600 hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="size-4 text-red-500" />
                <span className="text-xs text-red-600 hidden sm:inline">Offline</span>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Atualizar"
          >
            <RefreshCw className={`size-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationsClick}
            className="relative"
            aria-label={`Notificações: ${notificationCount} pendentes`}
          >
            <Bell className="size-5" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] animate-pulse"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            aria-label="Sair"
          >
            <LogOut className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
