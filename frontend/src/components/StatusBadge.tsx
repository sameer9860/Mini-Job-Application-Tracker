import type { Status } from '../lib/types';

const statusConfig: Record<Status, { label: string; className: string }> = {
  Applied: {
    label: 'Applied',
    className: 'bg-blue-100 text-blue-800',
  },
  Interviewing: {
    label: 'Interviewing',
    className: 'bg-amber-100 text-amber-800',
  },
  Offer: {
    label: 'Offer',
    className: 'bg-green-100 text-green-800',
  },
  Rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800',
  },
};

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
