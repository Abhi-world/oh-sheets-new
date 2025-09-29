-- Add unique constraint to monday_user_id to prevent duplicate profiles
-- and enable proper upsert behavior in google-oauth-exchange

ALTER TABLE profiles 
ADD CONSTRAINT profiles_monday_user_id_unique UNIQUE (monday_user_id);