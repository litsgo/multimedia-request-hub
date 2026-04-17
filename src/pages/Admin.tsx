import { useMemo, useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns';
import * as XLSX from 'xlsx';
import { Download, Eye, EyeOff, Search } from 'lucide-react';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useRequests } from '@/hooks/useRequests';
import { STATUS_LABELS, TASK_TYPE_LABELS } from '@/types';
import type { RequestWithEmployee, TaskStatus, TaskType } from '@/types';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

const Admin = () => {
  const { data: requests = [], isLoading } = useRequests();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin:authenticated') === 'true';
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Preserve admin authentication when redirected from the login page.
    setIsAuthenticated(localStorage.getItem('admin:authenticated') === 'true');
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [searchQuery, setSearchQuery] = useState('');

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL ?? 'multimediabugemco@gmail.com';
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD ?? 'multimediabugemco@2025';

  const exportRows = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const interval = {
      start: startOfMonth(new Date(year, month - 1)),
      end: endOfMonth(new Date(year, month - 1)),
    };

    return requests
      .filter((request) => {
        const requestedDate = new Date(request.date_requested);
        return isWithinInterval(requestedDate, interval);
      })
      .map((request: RequestWithEmployee) => ({
        'Task ID': request.task_id,
        'Requester Name': request.employee.full_name,
        'Employee ID': request.employee.employee_id,
        'Branch / Department': request.employee.branch,
        Email: request.employee.email ?? '',
        'Task Type': TASK_TYPE_LABELS[request.task_type as TaskType],
        Description: request.task_description,
        'Date Requested': format(new Date(request.date_requested), 'yyyy-MM-dd'),
        Deadline: format(new Date(request.target_completion_date), 'yyyy-MM-dd'),
        Status: STATUS_LABELS[request.status as TaskStatus],
        Notes: request.notes ?? '',
      }));
  }, [requests, selectedMonth]);

  const handleExport = () => {
    if (isLoading) {
      toast.info('Loading requests. Please try again in a moment.');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please log in to download reports.');
      return;
    }

    if (exportRows.length === 0) {
      toast.warning('No requests available to export.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const monthLabel = format(new Date(`${selectedMonth}-01`), 'yyyy-MM');
    const fileName = `Multimedia Request Report Form-${monthLabel}.csv`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (email === adminEmail && password === adminPassword) {
      localStorage.setItem('admin:authenticated', 'true');
      setIsAuthenticated(true);
      setEmail('');
      setPassword('');
      toast.success('Logged in successfully.');
    } else {
      toast.error('Invalid email or password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin:authenticated');
    setIsAuthenticated(false);
    toast.success('Logged out.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end mb-6">
          {isAuthenticated ? (
            <div className="flex flex-wrap gap-2 justify-end w-full items-center">
              <Label htmlFor="export-month" className="shrink-0">
                Export month
              </Label>
              <Input
                id="export-month"
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="w-[180px]"
              />
              <Button onClick={handleExport} className="gap-2" disabled={isLoading}>
                <Download className="h-4 w-4" />
                Download CSV Report
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          ) : null}
        </div>

        {!isAuthenticated ? (
          <div className="mx-auto max-w-md">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-xl">Admin Login</CardTitle>
                <CardDescription>Enter your admin credentials to continue.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="multimediabugemco@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute inset-y-0 right-3 flex items-center justify-center text-muted-foreground"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Log in
                  </Button>
                </form>
                <div className="mt-4">
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full hover:bg-[#ffd800] hover:text-[#006633]"
                  >
                    <Link to="/">Back</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by task ID, requester name, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Dashboard 
              requests={requests.filter((request) => {
                const query = searchQuery.trim().toLowerCase();
                if (!query) return true;

                const taskId = request.task_id?.toLowerCase() ?? '';
                const requester = request.employee?.full_name?.toLowerCase() ?? '';
                const description = request.task_description?.toLowerCase() ?? '';
                const branch = request.employee?.branch?.toLowerCase() ?? '';
                const taskType = TASK_TYPE_LABELS[request.task_type as TaskType]?.toLowerCase() ?? '';

                return (
                  taskId.includes(query) ||
                  requester.includes(query) ||
                  description.includes(query) ||
                  branch.includes(query) ||
                  taskType.includes(query)
                );
              })} 
              isLoading={isLoading} 
              hideNewRequestButton 
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;
