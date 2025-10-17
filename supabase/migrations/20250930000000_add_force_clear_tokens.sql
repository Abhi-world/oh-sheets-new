-- Create the google_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monday_user_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_google_tokens_monday_user_id
ON google_tokens(monday_user_id);

-- Enable Row Level Security (optional, for security)
ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to access (required for Edge Functions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'google_tokens' AND policyname = 'Allow service role full access'
  ) THEN
    CREATE POLICY "Allow service role full access"
    ON google_tokens
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
  END IF;
END
$$;

-- Create or replace the function to force clear tokens
CREATE OR REPLACE FUNCTION force_clear_google_tokens(p_monday_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  -- Delete from google_tokens table
  DELETE FROM google_tokens WHERE monday_user_id = p_monday_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;