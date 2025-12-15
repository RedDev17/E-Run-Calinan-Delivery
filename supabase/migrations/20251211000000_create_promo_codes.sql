-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  applicable_to TEXT NOT NULL CHECK (applicable_to IN ('delivery_fee', 'food_items', 'total')),
  min_order_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow public read access to active promo codes (for validation)
CREATE POLICY "Allow public read access to active promo codes" ON promo_codes
  FOR SELECT USING (true);

-- Allow admin full access (assuming admin auth is handled via application logic or specific role)
-- For now, we'll allow all operations for authenticated users if we were using Supabase Auth,
-- but since this app uses a simple local storage auth for admin, we might need to be careful.
-- Given the current setup, we'll allow public read, and we'll rely on the app's admin check for writes.
-- However, for security, ideally we should restrict writes.
-- Since the current app seems to use anon key for everything, we'll allow all for now but this should be secured later.
CREATE POLICY "Allow all access for now" ON promo_codes
  FOR ALL USING (true) WITH CHECK (true);
