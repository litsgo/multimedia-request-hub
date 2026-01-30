-- Add dimension column to requests table
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS dimension TEXT;
