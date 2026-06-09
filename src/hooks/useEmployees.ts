import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Employee } from '@/types';

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async (): Promise<Employee[]> => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name');

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      employee_id: string;
      full_name: string;
      branch: string;
      email?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('employees')
        .insert({
          employee_id: data.employee_id,
          full_name: data.full_name,
          branch: data.branch,
          email: data.email || null,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: {
      id: string;
      employee_id: string;
      full_name: string;
      branch: string;
      email?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('employees')
        .update({
          employee_id: employee.employee_id,
          full_name: employee.full_name,
          branch: employee.branch,
          email: employee.email ?? null,
        })
        .eq('id', employee.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from('employees').delete().eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Employee not found or not deleted.');
      }
      return id;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['employees'] });

      const previousEmployees = queryClient.getQueryData<Employee[]>(['employees']);
      if (previousEmployees) {
        queryClient.setQueryData<Employee[]>(['employees'], previousEmployees.filter((employee) => employee.id !== id));
      }

      return { previousEmployees };
    },
    onError: (_error, _id, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(['employees'], context.previousEmployees);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

export function useFindOrCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      employee_id: string;
      full_name: string;
      branch: string;
      email?: string;
    }): Promise<Employee> => {
      // First, try to find existing employee
      const { data: existing } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', data.employee_id)
        .single();

      if (existing) {
        // Update email if provided and different
        if (data.email && existing.email !== data.email) {
          const { data: updated, error: updateError } = await supabase
            .from('employees')
            .update({ email: data.email })
            .eq('employee_id', data.employee_id)
            .select()
            .single();
          if (updateError) throw updateError;
          return updated;
        }
        return existing;
      }

      // Create new employee if not found
      const { data: result, error } = await supabase
        .from('employees')
        .insert({
          employee_id: data.employee_id,
          full_name: data.full_name,
          branch: data.branch,
          email: data.email || null,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
