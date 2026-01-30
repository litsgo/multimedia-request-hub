export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type TaskType = 'tarpaulin_design' | 'video_editing' | 'poster_layout' | 'social_media_content' | 'other';

export interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  branch: string;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Request {
  id: string;
  task_id: string;
  employee_id: string;
  task_type: TaskType;
  task_description: string;
  date_requested: string;
  target_completion_date: string;
  status: TaskStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface RequestWithEmployee extends Request {
  employee: Employee;
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  tarpaulin_design: 'Tarpaulin Design',
  video_editing: 'Video Editing',
  poster_layout: 'Poster Layout',
  social_media_content: 'Social Media Content',
  other: 'Other',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
