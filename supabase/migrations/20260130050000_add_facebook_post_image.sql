-- Add Facebook post image URL to requests
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS facebook_post_image_url TEXT;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create public read policy for request-assets bucket
CREATE POLICY "Public read request assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'request-assets')
WITH CHECK (bucket_id = 'request-assets');

-- Create public insert policy for request-assets bucket  
CREATE POLICY "Public insert request assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'request-assets');
