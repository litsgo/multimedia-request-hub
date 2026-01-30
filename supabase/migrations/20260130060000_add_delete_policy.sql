-- Add delete policy for requests table
CREATE POLICY "Allow public delete access on requests" 
ON public.requests FOR DELETE 
USING (true);
