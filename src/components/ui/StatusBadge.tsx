import React from 'react';

type BadgeVariant = 'pending' | 'processing' | 'review' | 'finalized' | 'draft' | 'failed';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
}

const variantMap: Record<BadgeVariant, { className: string; dot: string; defaultLabel: string }> = {
  pending: { className: 'badge-pending', dot: 'bg-warning', defaultLabel: 'Pending' },
  processing: { className: 'badge-processing', dot: 'bg-info', defaultLabel: 'Processing' },
  review: { className: 'badge-review', dot: 'bg-orange-500', defaultLabel: 'Needs Review' },
  finalized: { className: 'badge-finalized', dot: 'bg-positive', defaultLabel: 'Finalized' },
  draft: { className: 'badge-draft', dot: 'bg-muted-foreground', defaultLabel: 'Draft' },
  failed: { className: 'badge-failed', dot: 'bg-negative', defaultLabel: 'Failed' },
};

export default function StatusBadge({ variant, label }: StatusBadgeProps) {
  const config = variantMap[variant];
  return (
    <span className={`status-badge ${config.className}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label ?? config.defaultLabel}
    </span>
  );
}