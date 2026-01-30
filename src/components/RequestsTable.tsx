import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from './StatusBadge';
import { TaskTypeBadge } from './TaskTypeBadge';
import { useUpdateRequestStatus } from '@/hooks/useRequests';
import type { RequestWithEmployee, TaskStatus } from '@/types';
import { STATUS_LABELS } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface RequestsTableProps {
  requests: RequestWithEmployee[];
  isLoading?: boolean;
}

export function RequestsTable({ requests, isLoading }: RequestsTableProps) {
  const updateStatus = useUpdateRequestStatus();

  const handleStatusChange = async (requestId: string, newStatus: TaskStatus) => {
    await updateStatus.mutateAsync({ id: requestId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-secondary p-4 mb-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground">No requests yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first request to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Task ID</TableHead>
            <TableHead className="font-semibold">Requester</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold">Date Requested</TableHead>
            <TableHead className="font-semibold">Deadline</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} className="animate-fade-in">
              <TableCell className="font-mono text-sm font-medium">
                {request.task_id}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-foreground">{request.employee.full_name}</p>
                  <p className="text-xs text-muted-foreground">{request.employee.branch}</p>
                </div>
              </TableCell>
              <TableCell>
                <TaskTypeBadge type={request.task_type} />
              </TableCell>
              <TableCell className="max-w-[200px]">
                <p className="truncate text-sm" title={request.task_description}>
                  {request.task_description}
                </p>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(request.date_requested), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(request.target_completion_date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <Select
                  value={request.status}
                  onValueChange={(value) => handleStatusChange(request.id, value as TaskStatus)}
                >
                  <SelectTrigger className="w-[140px] h-8 border-0 p-0 focus:ring-0">
                    <StatusBadge status={request.status} />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
