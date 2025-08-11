-- ============================================================================
-- Add emed_patient_id to user_profiles
-- This field stores the patient ID from the external EMed system
-- ============================================================================

-- Add emed_patient_id column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN emed_patient_id VARCHAR(50);

-- Create index for better performance when querying by emed_patient_id
CREATE INDEX idx_user_profiles_emed_patient_id ON user_profiles(emed_patient_id);

-- Add unique constraint to ensure no duplicate emed_patient_ids
ALTER TABLE user_profiles 
ADD CONSTRAINT unique_emed_patient_id 
UNIQUE (emed_patient_id);

-- ============================================================================
-- Comments and Documentation
-- ============================================================================

COMMENT ON COLUMN user_profiles.emed_patient_id IS 'External EMed system patient identifier';

/*
USAGE EXAMPLES:

-- Update a user's emed_patient_id
UPDATE user_profiles 
SET emed_patient_id = 'EMED_12345', updated_at = NOW() 
WHERE id = 'user-uuid-here';

-- Find user by emed_patient_id
SELECT * FROM user_profiles 
WHERE emed_patient_id = 'EMED_12345';

-- Get all users with emed_patient_ids
SELECT id, first_name, last_name, email, emed_patient_id 
FROM user_profiles 
WHERE emed_patient_id IS NOT NULL;
*/