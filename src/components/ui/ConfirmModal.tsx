'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative bg-card rounded-2xl shadow-modal p-6 w-full max-w-md mx-4 animate-scale-in">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
        >
          <X size={14} className="text-muted-foreground" />
        </button>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${variant === 'danger' ? 'bg-negative-bg' : 'bg-secondary'}`}>
          <AlertTriangle size={20} className={variant === 'danger' ? 'text-negative' : 'text-primary'} />
        </div>
        <h3 className="text-base font-700 text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 btn-secondary px-4 py-2.5 rounded-lg text-sm font-600"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-600 text-white transition-all duration-150 active:scale-95 ${
              variant === 'danger' ? 'bg-negative hover:bg-red-600' : 'btn-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}