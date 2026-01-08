/**
 * Table Selection Modal Component
 * Modal for customer to select a table and optionally scan QR code
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, ArrowRight, Loader2 } from 'lucide-react';
import type { PublicTable } from '@/lib/api/tables';

interface TableSelectionModalProps {
  table: PublicTable | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onScanQr: () => void;
  isLoading?: boolean;
}

export function TableSelectionModal({
  table,
  isOpen,
  onClose,
  onConfirm,
  onScanQr,
  isLoading = false,
}: TableSelectionModalProps): JSX.Element {
  if (!table) return <></>;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Mesa {table.number}</DialogTitle>
          <DialogDescription>
            Capacidade para {table.capacity} pessoas
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <p className="text-center text-muted-foreground">
            Como deseja acessar esta mesa?
          </p>

          <div className="grid gap-3">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ArrowRight className="size-5" />
              )}
              Ocupar Mesa
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={onScanQr}
              disabled={isLoading}
            >
              <QrCode className="size-5" />
              Escanear QR Code da Mesa
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
