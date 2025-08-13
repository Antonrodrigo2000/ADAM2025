-- ============================================================================
-- Checkout Sessions for Secure, Reliable Checkout Flow
-- Migration: 009_checkout_sessions
-- ============================================================================

-- ============================================================================
-- 1. CHECKOUT SESSIONS TABLE
-- ============================================================================

-- Secure checkout sessions with cart recovery and analytics
CREATE TABLE checkout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Session identification
    session_token VARCHAR(32) UNIQUE NOT NULL, -- Short, URL-safe token (e.g., "cs_1234567890abcdef")
    
    -- User association (nullable for guest checkouts)
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Session state and progress
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
    current_step VARCHAR(20) DEFAULT 'information' CHECK (current_step IN ('information', 'payment', 'processing')),
    
    -- Cart contents (snapshot at session creation)
    cart_items JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{"product_id": "...", "quantity": 1, "price": 25.00}]
    cart_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    
    -- User information collected during checkout
    customer_info JSONB DEFAULT '{}'::jsonb, -- {"first_name": "...", "email": "...", "phone": "..."}
    shipping_address JSONB, -- {"street": "...", "city": "...", "postcode": "...", "country": "..."}
    billing_address JSONB,
    
    -- Payment information (references only, never store sensitive data)
    selected_payment_method_id UUID REFERENCES user_payment_methods(id), -- For authenticated users
    payment_intent_id VARCHAR(255), -- External payment gateway reference
    
    -- Session metadata
    source VARCHAR(50) DEFAULT 'web', -- web, mobile_app, api
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    
    -- Conversion tracking
    marketing_source VARCHAR(100), -- google, facebook, direct, etc.
    campaign_id VARCHAR(100),
    
    -- Timestamps and expiry
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'), -- 7-day expiry like Shopify
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. CHECKOUT SESSION EVENTS (Analytics & Audit)
-- ============================================================================

-- Track user actions within checkout sessions
CREATE TABLE checkout_session_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES checkout_sessions(id) ON DELETE CASCADE NOT NULL,
    
    -- Event details
    event_type VARCHAR(50) NOT NULL, -- session_created, step_completed, payment_attempted, etc.
    event_data JSONB DEFAULT '{}'::jsonb, -- Additional event-specific data
    
    -- Context
    step VARCHAR(20), -- information, payment, processing
    user_agent TEXT,
    ip_address INET,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Primary lookup indexes
CREATE INDEX idx_checkout_sessions_token ON checkout_sessions(session_token);
CREATE INDEX idx_checkout_sessions_user ON checkout_sessions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_checkout_sessions_status ON checkout_sessions(status);

-- Expiry and cleanup indexes
CREATE INDEX idx_checkout_sessions_expires ON checkout_sessions(expires_at);
CREATE INDEX idx_checkout_sessions_created ON checkout_sessions(created_at);

-- Analytics indexes
CREATE INDEX idx_checkout_sessions_source ON checkout_sessions(source);
CREATE INDEX idx_checkout_sessions_step_status ON checkout_sessions(current_step, status);

-- Event tracking indexes
CREATE INDEX idx_checkout_session_events_session ON checkout_session_events(session_id);
CREATE INDEX idx_checkout_session_events_type ON checkout_session_events(event_type);
CREATE INDEX idx_checkout_session_events_created ON checkout_session_events(created_at);

-- ============================================================================
-- 4. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to generate URL-safe session tokens
CREATE OR REPLACE FUNCTION generate_checkout_session_token()
RETURNS VARCHAR(32) AS $$
DECLARE
    token VARCHAR(32);
    exists_check INTEGER;
BEGIN
    -- Generate token with "cs_" prefix (checkout session)
    LOOP
        token := 'cs_' || encode(gen_random_bytes(15), 'hex');
        
        -- Check if token already exists
        SELECT 1 INTO exists_check 
        FROM checkout_sessions 
        WHERE session_token = token 
        LIMIT 1;
        
        -- If token doesn't exist, we can use it
        EXIT WHEN exists_check IS NULL;
    END LOOP;
    
    RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate session token on insert
CREATE OR REPLACE FUNCTION set_checkout_session_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.session_token IS NULL THEN
        NEW.session_token := generate_checkout_session_token();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_checkout_session_token
    BEFORE INSERT ON checkout_sessions
    FOR EACH ROW
    EXECUTE FUNCTION set_checkout_session_token();

-- Update updated_at timestamp
CREATE TRIGGER trigger_update_checkout_sessions_updated_at
    BEFORE UPDATE ON checkout_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-log session events on status/step changes
CREATE OR REPLACE FUNCTION log_checkout_session_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log step changes
    IF OLD.current_step IS DISTINCT FROM NEW.current_step THEN
        INSERT INTO checkout_session_events (session_id, event_type, event_data, step)
        VALUES (NEW.id, 'step_changed', jsonb_build_object(
            'from', OLD.current_step,
            'to', NEW.current_step
        ), NEW.current_step);
    END IF;
    
    -- Log status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO checkout_session_events (session_id, event_type, event_data)
        VALUES (NEW.id, 'status_changed', jsonb_build_object(
            'from', OLD.status,
            'to', NEW.status
        ));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_checkout_session_changes
    AFTER UPDATE ON checkout_sessions
    FOR EACH ROW
    EXECUTE FUNCTION log_checkout_session_changes();

-- ============================================================================
-- 5. CLEANUP FUNCTIONS
-- ============================================================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_checkout_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete sessions that have been expired for more than 30 days
    DELETE FROM checkout_sessions
    WHERE status = 'expired' 
    AND expires_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Auto-expire sessions that are past their expiry date
    UPDATE checkout_sessions
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active'
    AND expires_at < NOW();
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on checkout sessions
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_session_events ENABLE ROW LEVEL SECURITY;

-- Users can access their own sessions or sessions they created as guests
CREATE POLICY "Users can access their own checkout sessions" ON checkout_sessions
    FOR ALL USING (
        auth.uid() = user_id 
        OR user_id IS NULL -- Allow guest access for server-side session management
    );

-- System can manage all sessions (for API endpoints)
-- This will be handled at the application level with service role

-- Users can view events for their sessions
CREATE POLICY "Users can view their checkout session events" ON checkout_session_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM checkout_sessions cs
            WHERE cs.id = checkout_session_events.session_id
            AND (cs.user_id = auth.uid() OR cs.user_id IS NULL)
        )
    );

-- ============================================================================
-- 7. HELPER VIEWS FOR ANALYTICS
-- ============================================================================

-- Checkout conversion funnel view
CREATE VIEW checkout_funnel_analytics AS
SELECT 
    DATE(created_at) as date,
    source,
    COUNT(*) as sessions_started,
    COUNT(*) FILTER (WHERE current_step != 'information') as reached_payment,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
    ROUND(
        (COUNT(*) FILTER (WHERE current_step != 'information'))::decimal / 
        NULLIF(COUNT(*), 0) * 100, 2
    ) as information_to_payment_rate,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'completed'))::decimal / 
        NULLIF(COUNT(*), 0) * 100, 2
    ) as overall_conversion_rate
FROM checkout_sessions
GROUP BY DATE(created_at), source
ORDER BY date DESC, source;

-- Abandoned cart recovery view
CREATE VIEW abandoned_carts AS
SELECT 
    cs.id,
    cs.session_token,
    cs.user_id,
    cs.customer_info,
    cs.cart_items,
    cs.cart_total,
    cs.current_step,
    cs.created_at,
    cs.updated_at,
    cs.expires_at,
    EXTRACT(EPOCH FROM (NOW() - cs.updated_at))/3600 as hours_since_last_activity
FROM checkout_sessions cs
WHERE cs.status = 'active'
AND cs.updated_at < NOW() - INTERVAL '1 hour'  -- Inactive for at least 1 hour
AND cs.expires_at > NOW()  -- Not yet expired
AND jsonb_array_length(cs.cart_items) > 0  -- Has items in cart
ORDER BY cs.updated_at DESC;

-- ============================================================================
-- 8. USAGE EXAMPLES
-- ============================================================================

/*
USAGE EXAMPLES:

-- Create a new checkout session
INSERT INTO checkout_sessions (cart_items, cart_total, user_id, source)
VALUES (
    '[{"product_id": "prod_123", "quantity": 1, "price": 25.00}]'::jsonb,
    25.00,
    'user-uuid-here', -- NULL for guest checkout
    'web'
);

-- Get session by token
SELECT * FROM checkout_sessions 
WHERE session_token = 'cs_1234567890abcdef'
AND status = 'active'
AND expires_at > NOW();

-- Update session progress
UPDATE checkout_sessions
SET current_step = 'payment',
    customer_info = '{"first_name": "John", "email": "john@example.com"}'::jsonb,
    shipping_address = '{"street": "123 Main St", "city": "Colombo"}'::jsonb,
    updated_at = NOW()
WHERE session_token = 'cs_1234567890abcdef';

-- Complete checkout session
UPDATE checkout_sessions
SET status = 'completed',
    completed_at = NOW(),
    current_step = 'processing'
WHERE session_token = 'cs_1234567890abcdef';

-- Extend session expiry (for active users)
UPDATE checkout_sessions
SET expires_at = NOW() + INTERVAL '7 days',
    updated_at = NOW()
WHERE session_token = 'cs_1234567890abcdef'
AND status = 'active';

-- Get abandoned carts for recovery email
SELECT * FROM abandoned_carts
WHERE hours_since_last_activity BETWEEN 24 AND 72
AND customer_info->>'email' IS NOT NULL;

-- Analytics: Conversion rates by source
SELECT * FROM checkout_funnel_analytics
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC, sessions_started DESC;

-- Clean up old sessions (run via cron job)
SELECT cleanup_expired_checkout_sessions();
*/

-- ============================================================================
-- 9. INITIAL DATA AND SETUP
-- ============================================================================

-- Create an index for the cleanup function to run efficiently
CREATE INDEX idx_checkout_sessions_cleanup 
ON checkout_sessions(status, expires_at) 
WHERE status IN ('active', 'expired');

-- Grant necessary permissions (adjust based on your auth setup)
-- GRANT ALL ON checkout_sessions TO authenticated;
-- GRANT ALL ON checkout_session_events TO authenticated;

COMMENT ON TABLE checkout_sessions IS 'Secure checkout sessions for reliable, recoverable checkout flow';
COMMENT ON TABLE checkout_session_events IS 'Event tracking for checkout session analytics and audit trails';
COMMENT ON COLUMN checkout_sessions.session_token IS 'URL-safe token for checkout session (e.g., cs_1234567890abcdef)';
COMMENT ON COLUMN checkout_sessions.cart_items IS 'Snapshot of cart items at session creation';
COMMENT ON COLUMN checkout_sessions.expires_at IS 'Session expiry time (7 days default, like Shopify)';