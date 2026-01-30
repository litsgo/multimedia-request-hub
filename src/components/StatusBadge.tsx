import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/types';
import { STATUS_LABELS } from '@/types';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusStyles: Record<TaskStatus, string> = {
  pending: 'bg-status-pending-bg text-status-pending border-status-pending/30',
  in_progress: 'bg-status-progress-bg text-status-progress border-status-progress/30',
  completed: 'bg-status-completed-bg text-status-completed border-status-completed/30',
  cancelled: 'bg-status-cancelled-bg text-status-cancelled border-status-cancelled/30',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
