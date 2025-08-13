-- Fix checkout session token length issue
-- Migration: 010_fix_session_token_length

-- Drop views that depend on session_token column
DROP VIEW IF EXISTS abandoned_carts CASCADE;
DROP VIEW IF EXISTS checkout_funnel_analytics CASCADE;

-- Update the session_token column to accommodate longer tokens
ALTER TABLE checkout_sessions 
ALTER COLUMN session_token TYPE VARCHAR(40);

-- Update the function to generate tokens that fit properly
CREATE OR REPLACE FUNCTION generate_checkout_session_token()
RETURNS VARCHAR(40) AS $$
DECLARE
    token VARCHAR(40);
    exists_check INTEGER;
BEGIN
    -- Generate token with "cs_" prefix (checkout session)
    -- 'cs_' (3 chars) + 30 hex chars = 33 chars total
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

-- Recreate the views with updated references
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

-- Update comment
COMMENT ON COLUMN checkout_sessions.session_token IS 'URL-safe token for checkout session (e.g., cs_1234567890abcdef123456789012345678)';