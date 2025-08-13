-- Add NIC column to user_profiles table for identity verification
-- This allows tracking unique national identity card numbers to prevent duplicate registrations

-- Add nic column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN nic VARCHAR(20) UNIQUE;

-- Create index for efficient NIC lookups
CREATE INDEX idx_user_profiles_nic ON user_profiles(nic);

-- Add constraint for NIC format validation (Sri Lankan NIC format)
-- Supports both old format (9 digits + V/X) and new format (12 digits)
ALTER TABLE user_profiles 
ADD CONSTRAINT check_nic_format 
CHECK (nic IS NULL OR nic ~ '^([0-9]{9}[VXvx]|[0-9]{12})$');

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.nic IS 'National Identity Card number for unique user identification and preventing duplicate registrations';