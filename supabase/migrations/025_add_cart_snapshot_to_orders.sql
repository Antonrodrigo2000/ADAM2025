-- ============================================================================
-- Add Cart Snapshot to Orders Table (Industry Standard Payment Flow)
-- Migration: 025_add_cart_snapshot_to_orders
-- ============================================================================

-- Add cart snapshot to store cart data at order creation time
ALTER TABLE orders 
ADD COLUMN cart_snapshot JSONB;

-- Add session reference for tracking
ALTER TABLE orders 
ADD COLUMN session_id VARCHAR(100);

-- Update payment_pending status as valid initial state
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN (
    'payment_pending',    -- NEW: order created, payment not confirmed
    'pending', 
    'physician_review', 
    'approved', 
    'approved_pending_payment',  -- consultation approved, awaiting product payment
    'processing',         -- payment confirmed, order being fulfilled
    'shipped', 
    'completed', 
    'cancelled',
    'payment_failed'      -- payment failed after order creation
));

-- Index for session lookups
CREATE INDEX idx_orders_session_id ON orders(session_id) WHERE session_id IS NOT NULL;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN orders.cart_snapshot IS 'Snapshot of cart items at order creation time - prevents inconsistency if cart changes during payment';
COMMENT ON COLUMN orders.session_id IS 'Checkout session ID for tracking and correlation';

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
NEW INDUSTRY STANDARD FLOW:

1. Create order with payment_pending status BEFORE payment:
INSERT INTO orders (
    user_id, 
    status, 
    total_amount,
    cart_snapshot,
    session_id,
    payment_flow_type,
    payment_method_id,
    delivery_address
) VALUES (
    'user-uuid',
    'payment_pending',
    2500.00,
    '[{"product_id": "123", "quantity": 1, "price": 2500}]'::jsonb,
    'session-123',
    'consultation_first',
    'payment-method-uuid',
    '{"address": "data"}'::jsonb
);

2. Create payment with order.id as localId:
localId = order_uuid  -- Direct correlation

3. Webhook correlates directly to order:
SELECT * FROM orders WHERE id = webhook.localId::uuid
*/