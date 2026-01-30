import { useMemo, useState } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
} from 'date-fns';
import * as XLSX from 'xlsx';
import { Download, Search } from 'lucide-react';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRequests } from '@/hooks/useRequests';
import { STATUS_LABELS, TASK_TYPE_LABELS } from '@/types';
import type { RequestWithEmployee, TaskStatus, TaskType } from '@/types';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const Admin = () => {
  const { data: requests = [], isLoading } = useRequests();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin:authenticated') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [searchQuery, setSearchQuery] = useState('');

  const adminUsername = import.meta.env.VITE_ADMIN_USERNAME ?? 'multimediabugemco';
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD ?? 'multimediabugemco@2025';

  const exportRows = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (reportPeriod) {
      case 'monthly':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'yearly':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case 'weekly':
      default:
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
    }

    return requests
      .filter((request) =>
        isWithinInterval(new Date(request.date_requested), { start, end })
      )
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
  }, [requests, reportPeriod]);

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
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Requests');
    const fileName = `Multimedia Request Report Form-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (username === adminUsername && password === adminPassword) {
      localStorage.setItem('admin:authenticated', 'true');
      setIsAuthenticated(true);
      setUsername('');
      setPassword('');
      toast.success('Logged in successfully.');
    } else {
      toast.error('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin:authenticated');
    setIsAuthenticated(false);
    toast.success('Logged out.');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-display text-foreground">Please enter your login credentials.</h2>
            <p className="text-muted-foreground">
              For Admin Only.
            </p>
          </div>
          {isAuthenticated ? (
            <div className="flex flex-wrap gap-2">
              <Select
                value={reportPeriod}
                onValueChange={(value) => setReportPeriod(value as 'weekly' | 'monthly' | 'yearly')}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExport} className="gap-2" disabled={isLoading}>
                <Download className="h-4 w-4" />
                Download Excel Report
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
                    <Label htmlFor="admin-username">Username</Label>
                    <Input
                      id="admin-username"
                      autoComplete="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter password"
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="admin-show-password"
                        checked={showPassword}
                        onCheckedChange={(checked) => setShowPassword(Boolean(checked))}
                      />
                      <Label htmlFor="admin-show-password" className="text-sm text-muted-foreground">
                        Show password
                      </Label>
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
                const query = searchQuery.toLowerCase();
                return (
                  request.task_id.toLowerCase().includes(query) ||
                  request.employee.full_name.toLowerCase().includes(query) ||
                  request.task_description.toLowerCase().includes(query) ||
                  request.employee.branch.toLowerCase().includes(query) ||
                  TASK_TYPE_LABELS[request.task_type as TaskType].toLowerCase().includes(query)
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
