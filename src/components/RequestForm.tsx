import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useFindOrCreateEmployee } from '@/hooks/useEmployees';
import { useCreateRequest } from '@/hooks/useRequests';
import { supabase } from '@/integrations/supabase/client';
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
  email: z.string().email('Invalid email'),
  task_type: z.enum(['tarpaulin_design', 'video_editing', 'poster_layout', 'social_media_content', 'other'] as const),
  task_description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  target_completion_date: z.date({
    required_error: 'Target completion date is required',
  }),
  urgency: z.enum(['urgent', 'can_wait']),
  notes: z.string().max(500).optional(),
  facebook_post_image: z.instanceof(File).nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.task_type === 'social_media_content' && !data.facebook_post_image) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Facebook post image is required.',
      path: ['facebook_post_image'],
    });
  }
});

type FormData = z.infer<typeof formSchema>;

interface RequestFormProps {
  onSuccess?: () => void;
}

export function RequestForm({ onSuccess }: RequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const findOrCreateEmployee = useFindOrCreateEmployee();
  const createRequest = useCreateRequest();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: '',
      full_name: '',
      branch: '',
      email: '',
      task_type: 'other',
      task_description: '',
      urgency: 'can_wait',
      notes: '',
      facebook_post_image: null,
    },
  });

  const taskType = form.watch('task_type');

  useEffect(() => {
    if (taskType !== 'social_media_content') {
      form.setValue('facebook_post_image', null, { shouldValidate: true });
    }
  }, [form, taskType]);

  const uploadFacebookPostImage = async (file: File, employeeId: string) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `facebook-posts/${employeeId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from('request-assets')
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('request-assets')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

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
      const urgencyLabel = data.urgency === 'urgent' ? 'Urgent' : 'Can Wait';
      const notesWithUrgency = data.notes
        ? `Urgency: ${urgencyLabel}\n${data.notes}`
        : `Urgency: ${urgencyLabel}`;

      let facebookPostImageUrl: string | null = null;
      if (data.task_type === 'social_media_content' && data.facebook_post_image) {
        facebookPostImageUrl = await uploadFacebookPostImage(
          data.facebook_post_image,
          employee.employee_id
        );
      }

      await createRequest.mutateAsync({
        employee_id: employee.id,
        task_type: data.task_type,
        task_description: data.task_description,
        target_completion_date: data.target_completion_date.toISOString(),
        notes: notesWithUrgency,
        facebook_post_image_url: facebookPostImageUrl,
      });

      toast.success('Task added successfully.', { duration: 10000 });
      form.reset();
      onSuccess?.();
      setTimeout(() => {
        navigate(0);
      }, 10000);
    } catch (error) {
      console.error('Error submitting request:', error);
      const message = error instanceof Error ? error.message : 'Failed to submit request. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCancelConfirm = () => {
    toast.success('Cancelled successfully.', { duration: 10000 });
    form.reset();
    setIsCancelOpen(false);
    setTimeout(() => {
      navigate(0);
    }, 10000);
  };

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
                  <FormLabel>
                    Employee ID <span className="text-destructive">*</span>
                  </FormLabel>
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
                  <FormLabel>
                    Full Name <span className="text-destructive">*</span>
                  </FormLabel>
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
                  <FormLabel>
                    Branch / Department <span className="text-destructive">*</span>
                  </FormLabel>
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
                  <FormLabel>
                    Email <span className="text-destructive">*</span>
                  </FormLabel>
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
                  <FormLabel>
                    Task Type <span className="text-destructive">*</span>
                  </FormLabel>
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

            {taskType === 'social_media_content' && (
              <FormField
                control={form.control}
                name="facebook_post_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Facebook Post Image <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          field.onChange(file);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="target_completion_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Target Completion Date <span className="text-destructive">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal hover:bg-[#006633] hover:text-white',
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

            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Urgency <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="can_wait">Can Wait</SelectItem>
                    </SelectContent>
                  </Select>
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
                <FormLabel>
                  Task Description <span className="text-destructive">*</span>
                </FormLabel>
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

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelOpen(true)}
              disabled={isSubmitting}
              className="hover:bg-red-600 hover:text-white"
            >
              Cancel
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel request?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this request? Your changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:bg-[#006633] hover:text-white">No</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelConfirm}
                  className="bg-[#c40233] text-white hover:bg-[#a10028]"
                >
                  Yes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            type="submit"
            className="bg-primary hover:bg-[#ffd800] hover:text-[#006633]"
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
        </div>
      </form>
    </Form>
  );
}
