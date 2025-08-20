-- Add missing columns to profiles table for Monday.com and Google Sheets integration
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monday_access_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monday_refresh_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monday_token_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS google_access_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS google_token_expiry TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS google_sheets_credentials JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_spreadsheet_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_sheet_id TEXT;