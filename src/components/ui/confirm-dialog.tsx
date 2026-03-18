'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Confirmar acción',
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  destructive = true,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="border-white/[0.10] bg-[#0d1117] text-white sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-white text-base">{title}</DialogTitle>
          <DialogDescription className="text-white/60 text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-5 py-2 rounded-full border border-white/20 text-white/70 text-sm font-medium hover:bg-white/[0.06] hover:border-white/30 transition-all cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              destructive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
