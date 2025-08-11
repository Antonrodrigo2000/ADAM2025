-- ============================================================================
-- Add genie_customer_id to user_profiles and create user_payment_methods table
-- Migration: 008_add_genie_customer_id_and_payment_methods
-- ============================================================================

-- ============================================================================
-- 1. ADD GENIE_CUSTOMER_ID TO USER_PROFILES
-- ============================================================================

-- Add genie_customer_id column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN genie_customer_id VARCHAR(100);

-- Create index for better performance when querying by genie_customer_id
CREATE INDEX idx_user_profiles_genie_customer_id ON user_profiles(genie_customer_id);

-- Add unique constraint to ensure no duplicate genie_customer_ids
ALTER TABLE user_profiles 
ADD CONSTRAINT unique_genie_customer_id 
UNIQUE (genie_customer_id);

-- Add column comment
COMMENT ON COLUMN user_profiles.genie_customer_id IS 'External Genie payment system customer identifier';

-- ============================================================================
-- 2. CREATE USER_PAYMENT_METHODS TABLE
-- ============================================================================

-- User payment methods for storing tokenized payment information
CREATE TABLE user_payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Payment gateway information
    payment_token VARCHAR(500) NOT NULL, -- Tokenized payment method from gateway
    gateway_provider VARCHAR(50) NOT NULL DEFAULT 'dialog_ipg', -- dialog_ipg, stripe, etc.
    
    -- Credit card information (non-sensitive)
    card_last_four CHAR(4) NOT NULL, -- Last 4 digits of card
    card_brand VARCHAR(20), -- visa, mastercard, amex, etc.
    card_type VARCHAR(20), -- credit, debit
    cardholder_name VARCHAR(100),
    
    -- Card expiry (for display purposes)
    expiry_month INTEGER CHECK (expiry_month >= 1 AND expiry_month <= 12),
    expiry_year INTEGER CHECK (expiry_year >= EXTRACT(YEAR FROM NOW())),
    
    -- Payment method metadata
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Billing address (can be different from user's main address)
    billing_address JSONB,
    
    -- Gateway-specific metadata
    gateway_metadata JSONB,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure user can have only one default payment method
    CONSTRAINT unique_default_payment_method 
        EXCLUDE (user_id WITH =) WHERE (is_default = true AND is_active = true)
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for user lookups
CREATE INDEX idx_user_payment_methods_user_id ON user_payment_methods(user_id);

-- Index for active payment methods
CREATE INDEX idx_user_payment_methods_active ON user_payment_methods(user_id, is_active) WHERE is_active = true;

-- Index for default payment method lookup
CREATE INDEX idx_user_payment_methods_default ON user_payment_methods(user_id, is_default) WHERE is_default = true AND is_active = true;

-- Index for payment token (for gateway operations)
CREATE INDEX idx_user_payment_methods_token ON user_payment_methods(payment_token);

-- ============================================================================
-- 4. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_user_payment_methods_updated_at
    BEFORE UPDATE ON user_payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_user_payment_methods_updated_at();

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a payment method as default, unset all others for this user
    IF NEW.is_default = true AND NEW.is_active = true THEN
        UPDATE user_payment_methods 
        SET is_default = false 
        WHERE user_id = NEW.user_id 
          AND id != NEW.id 
          AND is_default = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single default payment method
CREATE TRIGGER trigger_ensure_single_default_payment_method
    BEFORE INSERT OR UPDATE ON user_payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_payment_method();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on user_payment_methods
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;

-- Users can only view their own payment methods
CREATE POLICY "Users can view their own payment methods" ON user_payment_methods
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = user_payment_methods.user_id 
            AND user_profiles.id = auth.uid()
        )
    );

-- Users can only insert their own payment methods
CREATE POLICY "Users can insert their own payment methods" ON user_payment_methods
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = user_payment_methods.user_id 
            AND user_profiles.id = auth.uid()
        )
    );

-- Users can only update their own payment methods
CREATE POLICY "Users can update their own payment methods" ON user_payment_methods
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = user_payment_methods.user_id 
            AND user_profiles.id = auth.uid()
        )
    );

-- Users can only delete their own payment methods
CREATE POLICY "Users can delete their own payment methods" ON user_payment_methods
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = user_payment_methods.user_id 
            AND user_profiles.id = auth.uid()
        )
    );

-- ============================================================================
-- 6. COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE user_payment_methods IS 'Stores tokenized payment methods for users';
COMMENT ON COLUMN user_payment_methods.payment_token IS 'Tokenized payment method identifier from payment gateway';
COMMENT ON COLUMN user_payment_methods.gateway_provider IS 'Payment gateway provider (dialog_ipg, stripe, etc.)';
COMMENT ON COLUMN user_payment_methods.card_last_four IS 'Last 4 digits of credit card for display purposes';
COMMENT ON COLUMN user_payment_methods.card_brand IS 'Credit card brand (visa, mastercard, etc.)';
COMMENT ON COLUMN user_payment_methods.is_default IS 'Whether this is the users default payment method';
COMMENT ON COLUMN user_payment_methods.billing_address IS 'JSON object containing billing address details';
COMMENT ON COLUMN user_payment_methods.gateway_metadata IS 'Additional metadata from payment gateway';

-- ============================================================================
-- 7. USAGE EXAMPLES
-- ============================================================================

/*
USAGE EXAMPLES:

-- Update a user's genie_customer_id
UPDATE user_profiles 
SET genie_customer_id = 'GENIE_CUST_12345', updated_at = NOW() 
WHERE id = 'user-uuid-here';

-- Find user by genie_customer_id
SELECT * FROM user_profiles 
WHERE genie_customer_id = 'GENIE_CUST_12345';

-- Insert a new payment method
INSERT INTO user_payment_methods (
    user_id,
    payment_token,
    gateway_provider,
    card_last_four,
    card_brand,
    card_type,
    cardholder_name,
    expiry_month,
    expiry_year,
    is_default,
    billing_address
) VALUES (
    'user-uuid-here',
    'tok_1234567890abcdef',
    'dialog_ipg',
    '1234',
    'visa',
    'credit',
    'John Doe',
    12,
    2027,
    true,
    '{"street": "123 Main St", "city": "Colombo", "postal_code": "00100", "country": "LK"}'::jsonb
);

-- Get user's default payment method
SELECT * FROM user_payment_methods 
WHERE user_id = 'user-uuid-here' 
AND is_default = true 
AND is_active = true;

-- Get all active payment methods for a user
SELECT 
    id,
    card_last_four,
    card_brand,
    card_type,
    cardholder_name,
    expiry_month,
    expiry_year,
    is_default,
    created_at
FROM user_payment_methods 
WHERE user_id = 'user-uuid-here' 
AND is_active = true
ORDER BY is_default DESC, created_at DESC;

-- Update payment method as default (will automatically unset others)
UPDATE user_payment_methods 
SET is_default = true, updated_at = NOW()
WHERE id = 'payment-method-uuid' 
AND user_id = 'user-uuid-here';

-- Deactivate a payment method (soft delete)
UPDATE user_payment_methods 
SET is_active = false, updated_at = NOW()
WHERE id = 'payment-method-uuid' 
AND user_id = 'user-uuid-here';

-- Update last used timestamp
UPDATE user_payment_methods 
SET last_used_at = NOW(), updated_at = NOW()
WHERE id = 'payment-method-uuid';

-- Get users with genie customer IDs for integration
SELECT 
    up.id,
    up.first_name,
    up.last_name,
    up.email,
    up.genie_customer_id,
    COUNT(upm.id) as payment_methods_count
FROM user_profiles up
LEFT JOIN user_payment_methods upm ON up.id = upm.user_id AND upm.is_active = true
WHERE up.genie_customer_id IS NOT NULL
GROUP BY up.id, up.first_name, up.last_name, up.email, up.genie_customer_id;
*/