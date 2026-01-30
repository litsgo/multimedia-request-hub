import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useFindOrCreateEmployee } from '@/hooks/useEmployees';
import { useCreateRequest } from '@/hooks/useRequests';
import { TASK_TYPE_LABELS } from '@/types';
import type { TaskType } from '@/types';
import { toast } from 'sonner';

const employeeIdPattern = /^\d{4}-\d{3}$/;

const formSchema = z.object({
  employee_id: z.string()
    .min(1, 'Employee ID is required')
    .regex(employeeIdPattern, 'Employee ID must be in format YYYY-BBB (e.g., 2025-322)'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  branch: z.string().min(2, 'Branch is required').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  task_type: z.enum(['tarpaulin_design', 'video_editing', 'poster_layout', 'social_media_content', 'other'] as const),
  task_description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  target_completion_date: z.date({
    required_error: 'Target completion date is required',
  }),
  notes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface RequestFormProps {
  onSuccess?: () => void;
}

export function RequestForm({ onSuccess }: RequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const findOrCreateEmployee = useFindOrCreateEmployee();
  const createRequest = useCreateRequest();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: '',
      full_name: '',
      branch: '',
      email: '',
      task_type: 'other',
      task_description: '',
      notes: '',
    },
  });

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    try {
      // First, find or create the employee
      const employee = await findOrCreateEmployee.mutateAsync({
        employee_id: data.employee_id,
        full_name: data.full_name,
        branch: data.branch,
        email: data.email || undefined,
      });

      // Then create the request
      await createRequest.mutateAsync({
        employee_id: employee.id,
        task_type: data.task_type,
        task_description: data.task_description,
        target_completion_date: data.target_completion_date.toISOString(),
        notes: data.notes,
      });

      toast.success('Request submitted successfully!');
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold font-display text-foreground">Employee Information</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID</FormLabel>
                  <FormControl>
                    <Input placeholder="2025-322" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Dela Cruz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch / Department</FormLabel>
                  <FormControl>
                    <Input placeholder="Marketing Department" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="juan@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold font-display text-foreground">Task Details</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="task_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.entries(TASK_TYPE_LABELS) as [TaskType, string][]).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_completion_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Target Completion Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="task_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the multimedia task in detail..."
                    className="min-h-[120px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional notes or special requirements..."
                    className="min-h-[80px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Request'
          )}
        </Button>
      </form>
    </Form>
  );
}
