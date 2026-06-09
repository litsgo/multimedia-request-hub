import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Eye, Trash2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEmployees, useUpdateEmployee, useDeleteEmployee } from '@/hooks/useEmployees';
import type { Employee } from '@/types';
import { toast } from 'sonner';

const RequesterAccountsPage = () => {
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeForm, setEmployeeForm] = useState({
    id: '',
    employee_id: '',
    full_name: '',
    branch: '',
    email: '',
  });
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { data: employees = [], isLoading: isEmployeesLoading } = useEmployees();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const filteredEmployees = useMemo(() => {
    const query = employeeSearchQuery.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((employee) => {
      const fullName = employee.full_name.toLowerCase();
      const employeeId = employee.employee_id.toLowerCase();
      const branch = employee.branch.toLowerCase();
      const emailValue = employee.email?.toLowerCase() ?? '';
      return (
        fullName.includes(query) ||
        employeeId.includes(query) ||
        branch.includes(query) ||
        emailValue.includes(query)
      );
    });
  }, [employees, employeeSearchQuery]);

  const openEmployeeEditor = (employee: Employee) => {
    setDialogMode('edit');
    setSelectedEmployee(employee);
    setEmployeeForm({
      id: employee.id,
      employee_id: employee.employee_id,
      full_name: employee.full_name,
      branch: employee.branch,
      email: employee.email ?? '',
    });
  };

  const openEmployeeViewer = (employee: Employee) => {
    setDialogMode('view');
    setSelectedEmployee(employee);
    setEmployeeForm({
      id: employee.id,
      employee_id: employee.employee_id,
      full_name: employee.full_name,
      branch: employee.branch,
      email: employee.email ?? '',
    });
  };

  const openDeleteEmployeeDialog = (employee: Employee) => {
    openEmployeeViewer(employee);
    setIsDeleteDialogOpen(true);
  };

  const closeEmployeeEditor = () => {
    setSelectedEmployee(null);
    setDialogMode('view');
    setIsDeleteDialogOpen(false);
    setEmployeeForm({
      id: '',
      employee_id: '',
      full_name: '',
      branch: '',
      email: '',
    });
  };

  const handleEmployeeFormChange = (field: keyof typeof employeeForm, value: string) => {
    setEmployeeForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveEmployee = async () => {
    if (!selectedEmployee) return;

    setIsSavingEmployee(true);
    try {
      await updateEmployee.mutateAsync(employeeForm);
      toast.success('Requester account updated successfully.');
      closeEmployeeEditor();
    } catch (error) {
      console.error('Employee update failed:', error);
      toast.error('Unable to update requester account.');
    } finally {
      setIsSavingEmployee(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      await deleteEmployee.mutateAsync(selectedEmployee.id);
      toast.success('Requester account deleted successfully.');
      setIsDeleteDialogOpen(false);
      closeEmployeeEditor();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Unable to delete requester account.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Requester Account Management</h1>
            <p className="text-sm text-muted-foreground">Edit requester accounts and employee details in one place.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-xl">Requester Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search requester by name, email, branch, or employee ID..."
                value={employeeSearchQuery}
                onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.full_name}</TableCell>
                      <TableCell>{employee.employee_id}</TableCell>
                      <TableCell>{employee.branch}</TableCell>
                      <TableCell>{employee.email ?? 'No email'}</TableCell>
                      <TableCell className="flex flex-wrap gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEmployeeViewer(employee)}>
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        <Button size="sm" onClick={() => openEmployeeEditor(employee)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => openDeleteEmployeeDialog(employee)}>
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                        {isEmployeesLoading ? 'Loading requester accounts...' : 'No requester accounts found.'}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={Boolean(selectedEmployee) && !isDeleteDialogOpen} onOpenChange={(open) => !open && closeEmployeeEditor()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogMode === 'view' ? 'View requester account' : 'Edit requester account'}</DialogTitle>
              <DialogDescription>
                {dialogMode === 'view'
                  ? 'Review requester account details.'
                  : 'Update the requester name, employee ID, branch, or email.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="requester-account-name">Requester Name / Username</Label>
                <Input
                  id="requester-account-name"
                  value={employeeForm.full_name}
                  disabled={dialogMode === 'view'}
                  onChange={(event) => handleEmployeeFormChange('full_name', event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="requester-account-id">Employee ID</Label>
                <Input
                  id="requester-account-id"
                  value={employeeForm.employee_id}
                  disabled={dialogMode === 'view'}
                  onChange={(event) => handleEmployeeFormChange('employee_id', event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="requester-account-branch">Branch</Label>
                <Input
                  id="requester-account-branch"
                  value={employeeForm.branch}
                  disabled={dialogMode === 'view'}
                  onChange={(event) => handleEmployeeFormChange('branch', event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="requester-account-email">Email</Label>
                <Input
                  id="requester-account-email"
                  type="email"
                  value={employeeForm.email}
                  disabled={dialogMode === 'view'}
                  onChange={(event) => handleEmployeeFormChange('email', event.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeEmployeeEditor}>
                Close
              </Button>
              {dialogMode === 'edit' ? (
                <Button onClick={handleSaveEmployee} disabled={isSavingEmployee || !employeeForm.full_name || !employeeForm.employee_id || !employeeForm.branch}>
                  {isSavingEmployee ? 'Saving...' : 'Save changes'}
                </Button>
              ) : null}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && setIsDeleteDialogOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete requester account</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedEmployee?.full_name ?? 'this requester account'}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteEmployee}>
                Delete account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default RequesterAccountsPage;
