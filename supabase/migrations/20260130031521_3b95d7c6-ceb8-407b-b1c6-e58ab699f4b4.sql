-- Create enum for task status
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Create enum for task type
CREATE TYPE public.task_type AS ENUM ('tarpaulin_design', 'video_editing', 'poster_layout', 'social_media_content', 'other');

-- Create employees table
CREATE TABLE public.employees (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    branch TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create requests table
CREATE TABLE public.requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id TEXT NOT NULL UNIQUE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    task_type public.task_type NOT NULL DEFAULT 'other',
    task_description TEXT NOT NULL,
    date_requested TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    target_completion_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status public.task_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access for now - can add auth later)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Create public policies (allows all operations without auth for simplicity)
CREATE POLICY "Allow public read access on employees" 
ON public.employees FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access on employees" 
ON public.employees FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access on employees" 
ON public.employees FOR UPDATE 
USING (true);

CREATE POLICY "Allow public read access on requests" 
ON public.requests FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access on requests" 
ON public.requests FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access on requests" 
ON public.requests FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
BEFORE UPDATE ON public.requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate task ID (e.g., REQ-2025-0001)
CREATE OR REPLACE FUNCTION public.generate_task_id()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    seq_num INTEGER;
    new_task_id TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(
        CASE 
            WHEN task_id ~ ('^REQ-' || year_part || '-[0-9]{4}$')
            THEN SUBSTRING(task_id FROM '[0-9]{4}$')::INTEGER
            ELSE 0
        END
    ), 0) + 1 INTO seq_num
    FROM public.requests;
    
    new_task_id := 'REQ-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
    NEW.task_id := new_task_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-generate task ID
CREATE TRIGGER generate_task_id_trigger
BEFORE INSERT ON public.requests
FOR EACH ROW
WHEN (NEW.task_id IS NULL OR NEW.task_id = '')
EXECUTE FUNCTION public.generate_task_id();

-- Create indexes for better query performance
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_requests_date_requested ON public.requests(date_requested);
CREATE INDEX idx_requests_target_date ON public.requests(target_completion_date);
CREATE INDEX idx_requests_employee ON public.requests(employee_id);
CREATE INDEX idx_employees_employee_id ON public.employees(employee_id);