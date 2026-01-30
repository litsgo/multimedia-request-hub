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
