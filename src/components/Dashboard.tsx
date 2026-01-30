import { useMemo, useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { FileText, Clock, CheckCircle, XCircle, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from './StatsCard';
import { RequestForm } from './RequestForm';
import { RequestsTable } from './RequestsTable';
import { useRequests } from '@/hooks/useRequests';
import type { RequestWithEmployee, TaskStatus } from '@/types';

type ReportPeriod = 'all' | 'weekly' | 'monthly' | 'yearly';
type StatusFilter = 'all' | TaskStatus;

export function Dashboard() {
  const { data: requests = [], isLoading } = useRequests();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredRequests = useMemo(() => {
    const now = new Date();
    let filtered = [...requests];

    // Filter by period
    if (reportPeriod !== 'all') {
      let start: Date, end: Date;

      switch (reportPeriod) {
        case 'weekly':
          start = startOfWeek(now, { weekStartsOn: 1 });
          end = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case 'monthly':
          start = startOfMonth(now);
          end = endOfMonth(now);
          break;
        case 'yearly':
          start = startOfYear(now);
          end = endOfYear(now);
          break;
        default:
          start = new Date(0);
          end = now;
      }

      filtered = filtered.filter((req) =>
        isWithinInterval(new Date(req.date_requested), { start, end })
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    return filtered;
  }, [requests, reportPeriod, statusFilter]);

  const stats = useMemo(() => {
    const total = filteredRequests.length;
    const pending = filteredRequests.filter((r) => r.status === 'pending').length;
    const inProgress = filteredRequests.filter((r) => r.status === 'in_progress').length;
    const completed = filteredRequests.filter((r) => r.status === 'completed').length;
    const cancelled = filteredRequests.filter((r) => r.status === 'cancelled').length;

    return { total, pending, inProgress, completed, cancelled };
  }, [filteredRequests]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold font-display text-foreground">Dashboard</h2>
            <p className="text-muted-foreground">
              Track and manage multimedia requests
            </p>
          </div>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Submit New Request</DialogTitle>
              </DialogHeader>
              <RequestForm onSuccess={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Requests"
            value={stats.total}
            icon={FileText}
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={Filter}
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
          />
        </div>

        {/* Filters and Table */}
        <div className="rounded-xl bg-card p-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-lg font-semibold font-display text-foreground">
              All Requests
            </h3>

            <div className="flex flex-wrap gap-3">
              <Select value={reportPeriod} onValueChange={(v) => setReportPeriod(v as ReportPeriod)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="yearly">This Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <RequestsTable requests={filteredRequests} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
