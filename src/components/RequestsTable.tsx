import { useState } from 'react';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  const [selectedRequest, setSelectedRequest] = useState<RequestWithEmployee | null>(null);

  const handleStatusChange = async (requestId: string, newStatus: TaskStatus) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    try {
      await updateStatus.mutateAsync({ id: requestId, status: newStatus });
      
      // Send email notification to employee
      if (request.employee.email) {
        await sendStatusUpdateEmail({
          taskId: request.task_id,
          employeeEmail: request.employee.email,
          employeeName: request.employee.full_name,
          status: newStatus,
          taskType: request.task_type,
          description: request.task_description,
          deadline: request.target_completion_date,
        });
        toast.success(`Status updated and notification sent to ${request.employee.email}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
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
            <TableHead className="font-semibold">Action</TableHead>
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
              <TableCell>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedRequest(request)}
                  className="gap-1"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Task Details</DialogTitle>
            <DialogDescription>Request ID: {selectedRequest?.task_id}</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Requester Name</h3>
                  <p className="text-lg font-medium">{selectedRequest.employee.full_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Employee ID</h3>
                  <p className="text-lg font-medium">{selectedRequest.employee.employee_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Branch / Department</h3>
                  <p className="text-lg font-medium">{selectedRequest.employee.branch}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Email</h3>
                  <p className="text-lg font-medium">{selectedRequest.employee.email || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Task Type</h3>
                  <TaskTypeBadge type={selectedRequest.task_type} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Status</h3>
                  <StatusBadge status={selectedRequest.status} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Date Requested</h3>
                  <p className="text-lg font-medium">{format(new Date(selectedRequest.date_requested), 'PPP')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Target Completion Date</h3>
                  <p className="text-lg font-medium">{format(new Date(selectedRequest.target_completion_date), 'PPP')}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Task Description</h3>
                <p className="text-base text-foreground whitespace-pre-wrap bg-secondary/50 p-4 rounded-md">{selectedRequest.task_description}</p>
              </div>
              {selectedRequest.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Notes</h3>
                  <p className="text-base text-foreground whitespace-pre-wrap bg-secondary/50 p-4 rounded-md">{selectedRequest.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}