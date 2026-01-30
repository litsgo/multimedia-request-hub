import { cn } from '@/lib/utils';
import type { TaskType } from '@/types';
import { TASK_TYPE_LABELS } from '@/types';
import { Image, Video, FileText, Share2, MoreHorizontal } from 'lucide-react';

interface TaskTypeBadgeProps {
  type: TaskType;
  className?: string;
}

const typeIcons: Record<TaskType, React.ComponentType<{ className?: string }>> = {
  tarpaulin_design: Image,
  video_editing: Video,
  poster_layout: FileText,
  social_media_content: Share2,
  other: MoreHorizontal,
};

export function TaskTypeBadge({ type, className }: TaskTypeBadgeProps) {
  const Icon = typeIcons[type];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground',
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {TASK_TYPE_LABELS[type]}
    </span>
  );
}
