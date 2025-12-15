-- Add is_new_user_only column to promo_codes table
ALTER TABLE promo_codes
ADD COLUMN is_new_user_only BOOLEAN DEFAULT FALSE;

-- Create promo_usage_logs table to track usage by IP
CREATE TABLE promo_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
    ip_address TEXT NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on promo_usage_logs
ALTER TABLE promo_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policies for promo_usage_logs
-- Allow public insert (for logging usage during checkout)
CREATE POLICY "Allow public insert to promo_usage_logs"
ON promo_usage_logs FOR INSERT
TO public
WITH CHECK (true);

-- Allow public select (for validation)
CREATE POLICY "Allow public select from promo_usage_logs"
ON promo_usage_logs FOR SELECT
TO public
USING (true);

-- Allow authenticated users (admins) full access
CREATE POLICY "Allow admins full access to promo_usage_logs"
ON promo_usage_logs FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
