-- Create a public bucket for content images (admin uploads — cover images + inline images)
-- This bucket may already exist if created via Supabase dashboard; ON CONFLICT keeps it safe.
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read content-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-images');

-- Allow insert (cover image upload uses anon client; inline image upload uses service role route)
CREATE POLICY "Insert content-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'content-images');
