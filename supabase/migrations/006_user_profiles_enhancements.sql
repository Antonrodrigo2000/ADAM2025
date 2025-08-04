-- ============================================================================
-- User Profiles Enhancements
-- Add additional fields for healthcare compliance and user preferences
-- ============================================================================

-- Add new columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN sex VARCHAR(20), -- male, female, other, prefer_not_to_say
ADD COLUMN agreed_to_terms BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN agreed_to_terms_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN agreed_to_marketing BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN agreed_to_marketing_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN marketing_preferences JSONB DEFAULT '{}', -- email, sms, push notifications
ADD COLUMN privacy_preferences JSONB DEFAULT '{}', -- data sharing, analytics, etc.
ADD COLUMN account_status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleted
ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN email_verified BOOLEAN DEFAULT false,
ADD COLUMN phone_verified BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_sex ON user_profiles(sex);
CREATE INDEX idx_user_profiles_terms ON user_profiles(agreed_to_terms);
CREATE INDEX idx_user_profiles_marketing ON user_profiles(agreed_to_marketing);
CREATE INDEX idx_user_profiles_status ON user_profiles(account_status);
CREATE INDEX idx_user_profiles_last_login ON user_profiles(last_login_at);

-- Add constraints for data validation
ALTER TABLE user_profiles 
ADD CONSTRAINT check_sex_values 
CHECK (sex IN ('male', 'female', 'other', 'prefer_not_to_say'));

ALTER TABLE user_profiles 
ADD CONSTRAINT check_account_status_values 
CHECK (account_status IN ('active', 'suspended', 'deleted', 'pending_verification'));

ALTER TABLE user_profiles 
ADD CONSTRAINT check_verification_status_values 
CHECK (verification_status IN ('pending', 'partial', 'verified', 'rejected'));

-- Add constraint to ensure terms agreement timestamp is set when agreed
ALTER TABLE user_profiles 
ADD CONSTRAINT check_terms_agreement_timestamp 
CHECK (
  (agreed_to_terms = false) OR 
  (agreed_to_terms = true AND agreed_to_terms_at IS NOT NULL)
);

-- Add constraint to ensure marketing agreement timestamp is set when agreed
ALTER TABLE user_profiles 
ADD CONSTRAINT check_marketing_agreement_timestamp 
CHECK (
  (agreed_to_marketing = false) OR 
  (agreed_to_marketing = true AND agreed_to_marketing_at IS NOT NULL)
);

-- ============================================================================
-- Helper Functions for User Profile Management
-- ============================================================================

-- Function to update user consent
CREATE OR REPLACE FUNCTION update_user_consent(
  user_id_param UUID,
  terms_consent BOOLEAN DEFAULT NULL,
  marketing_consent BOOLEAN DEFAULT NULL,
  marketing_prefs JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    agreed_to_terms = COALESCE(terms_consent, agreed_to_terms),
    agreed_to_terms_at = CASE 
      WHEN terms_consent = true THEN NOW() 
      WHEN terms_consent = false THEN NULL
      ELSE agreed_to_terms_at 
    END,
    agreed_to_marketing = COALESCE(marketing_consent, agreed_to_marketing),
    agreed_to_marketing_at = CASE 
      WHEN marketing_consent = true THEN NOW() 
      WHEN marketing_consent = false THEN NULL
      ELSE agreed_to_marketing_at 
    END,
    marketing_preferences = COALESCE(marketing_prefs, marketing_preferences),
    updated_at = NOW()
  WHERE id = user_id_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last login timestamp
CREATE OR REPLACE FUNCTION update_last_login(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    last_login_at = NOW(),
    updated_at = NOW()
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft delete user profile
CREATE OR REPLACE FUNCTION soft_delete_user_profile(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    account_status = 'deleted',
    updated_at = NOW()
  WHERE id = user_id_param AND account_status != 'deleted';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Enhanced RLS Policies
-- ============================================================================

-- Update existing policies to account for account status
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Users can only view their own active profile
CREATE POLICY "Users can view their own active profile" ON user_profiles
    FOR SELECT USING (
      auth.uid() = id AND 
      account_status IN ('active', 'pending_verification')
    );

-- Users can update their own active profile
CREATE POLICY "Users can update their own active profile" ON user_profiles
    FOR UPDATE USING (
      auth.uid() = id AND 
      account_status IN ('active', 'pending_verification')
    );

-- Users can insert their own profile during registration
CREATE POLICY "Users can create their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- Audit Table for Profile Changes
-- ============================================================================

-- Create audit table for tracking profile changes (GDPR compliance)
CREATE TABLE user_profile_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    field_name VARCHAR(50), -- Which field was changed
    old_value TEXT, -- Previous value
    new_value TEXT, -- New value
    changed_by UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for audit queries
CREATE INDEX idx_user_profile_audit_user ON user_profile_audit(user_id, created_at);
CREATE INDEX idx_user_profile_audit_action ON user_profile_audit(action);

-- Enable RLS on audit table
ALTER TABLE user_profile_audit ENABLE ROW LEVEL SECURITY;

-- Users can only see their own audit records
CREATE POLICY "Users can view their own audit records" ON user_profile_audit
    FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- Trigger for Audit Logging
-- ============================================================================

-- Function to log profile changes
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log significant changes
    IF TG_OP = 'UPDATE' THEN
        -- Log consent changes
        IF OLD.agreed_to_terms != NEW.agreed_to_terms THEN
            INSERT INTO user_profile_audit (user_id, action, field_name, old_value, new_value, changed_by, ip_address)
            VALUES (NEW.id, 'UPDATE', 'agreed_to_terms', OLD.agreed_to_terms::text, NEW.agreed_to_terms::text, auth.uid(), inet_client_addr());
        END IF;
        
        IF OLD.agreed_to_marketing != NEW.agreed_to_marketing THEN
            INSERT INTO user_profile_audit (user_id, action, field_name, old_value, new_value, changed_by, ip_address)
            VALUES (NEW.id, 'UPDATE', 'agreed_to_marketing', OLD.agreed_to_marketing::text, NEW.agreed_to_marketing::text, auth.uid(), inet_client_addr());
        END IF;
        
        -- Log status changes
        IF OLD.account_status != NEW.account_status THEN
            INSERT INTO user_profile_audit (user_id, action, field_name, old_value, new_value, changed_by, ip_address)
            VALUES (NEW.id, 'UPDATE', 'account_status', OLD.account_status, NEW.account_status, auth.uid(), inet_client_addr());
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO user_profile_audit (user_id, action, changed_by, ip_address)
        VALUES (NEW.id, 'INSERT', auth.uid(), inet_client_addr());
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER log_user_profile_changes
    AFTER INSERT OR UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION log_profile_changes();

-- ============================================================================
-- Sample Data for Testing
-- ============================================================================

-- Update any existing profiles to have default consent values
UPDATE user_profiles 
SET 
    agreed_to_terms = false,
    agreed_to_marketing = false,
    account_status = 'active',
    email_verified = false,
    phone_verified = false
WHERE agreed_to_terms IS NULL;

-- ============================================================================
-- Comments and Documentation
-- ============================================================================

COMMENT ON COLUMN user_profiles.sex IS 'User biological sex: male, female, other, prefer_not_to_say';
COMMENT ON COLUMN user_profiles.agreed_to_terms IS 'Whether user has agreed to terms and conditions';
COMMENT ON COLUMN user_profiles.agreed_to_terms_at IS 'Timestamp when user agreed to terms';
COMMENT ON COLUMN user_profiles.agreed_to_marketing IS 'Whether user has consented to marketing communications';
COMMENT ON COLUMN user_profiles.agreed_to_marketing_at IS 'Timestamp when user agreed to marketing';
COMMENT ON COLUMN user_profiles.marketing_preferences IS 'JSON object with marketing channel preferences';
COMMENT ON COLUMN user_profiles.privacy_preferences IS 'JSON object with privacy and data sharing preferences';
COMMENT ON COLUMN user_profiles.account_status IS 'Current account status: active, suspended, deleted, pending_verification';
COMMENT ON COLUMN user_profiles.last_login_at IS 'Timestamp of users last login';
COMMENT ON COLUMN user_profiles.email_verified IS 'Whether users email address has been verified';
COMMENT ON COLUMN user_profiles.phone_verified IS 'Whether users phone number has been verified';

COMMENT ON TABLE user_profile_audit IS 'Audit trail for user profile changes (GDPR compliance)';

/*
USAGE EXAMPLES:

-- Update user consent
SELECT update_user_consent(
  'user-uuid-here'::uuid,
  true, -- agree to terms
  false, -- decline marketing
  '{"email": true, "sms": false, "push": true}'::jsonb -- marketing preferences
);

-- Update last login
SELECT update_last_login('user-uuid-here'::uuid);

-- Soft delete user
SELECT soft_delete_user_profile('user-uuid-here'::uuid);

-- Query user marketing preferences
SELECT 
  id,
  first_name,
  agreed_to_marketing,
  marketing_preferences->>'email' as email_marketing,
  marketing_preferences->>'sms' as sms_marketing
FROM user_profiles 
WHERE agreed_to_marketing = true;

-- GDPR compliance: Get all data for a user
SELECT * FROM user_profiles WHERE id = 'user-uuid-here';
SELECT * FROM user_profile_audit WHERE user_id = 'user-uuid-here';
*/