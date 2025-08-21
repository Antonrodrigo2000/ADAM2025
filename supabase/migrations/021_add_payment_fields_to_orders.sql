-- ============================================================================
-- Add Payment Method and Transaction ID fields to Orders table
-- Migration: 021_add_payment_fields_to_orders
-- ============================================================================

-- Add payment method reference to orders table
ALTER TABLE orders 
ADD COLUMN payment_method_id UUID REFERENCES user_payment_methods(id);

-- Add Genie transaction ID for payment tracking
ALTER TABLE orders 
ADD COLUMN genie_transaction_id VARCHAR(100);

-- Add payment status field (separate from order status)
ALTER TABLE orders 
ADD COLUMN payment_status VARCHAR(30) DEFAULT 'pending';
-- Values: pending, authorized, confirmed, failed, cancelled, voided, refunded

-- Add payment gateway provider for flexibility
ALTER TABLE orders 
ADD COLUMN payment_gateway VARCHAR(50) DEFAULT 'genie_business';

-- Add payment metadata for storing gateway-specific data
ALTER TABLE orders 
ADD COLUMN payment_metadata JSONB;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for payment method lookups
CREATE INDEX idx_orders_payment_method_id ON orders(payment_method_id) WHERE payment_method_id IS NOT NULL;

-- Index for Genie transaction ID lookups (for webhook processing)
CREATE INDEX idx_orders_genie_transaction_id ON orders(genie_transaction_id) WHERE genie_transaction_id IS NOT NULL;

-- Index for payment status queries
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- Compound index for payment reconciliation
CREATE INDEX idx_orders_payment_gateway_status ON orders(payment_gateway, payment_status);

-- ============================================================================
-- CONSTRAINTS AND VALIDATION
-- ============================================================================

-- Add check constraint for payment status values
ALTER TABLE orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'authorized', 'confirmed', 'failed', 'cancelled', 'voided', 'refunded'));

-- Add check constraint for payment gateway values
ALTER TABLE orders 
ADD CONSTRAINT orders_payment_gateway_check 
CHECK (payment_gateway IN ('genie_business', 'dialog_ipg', 'stripe', 'paypal'));

-- ============================================================================
-- FUNCTIONS FOR PAYMENT STATUS MANAGEMENT
-- ============================================================================

-- Function to update payment status and order status together
CREATE OR REPLACE FUNCTION update_order_payment_status(
    order_uuid UUID,
    new_payment_status VARCHAR(30),
    transaction_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    current_order_status VARCHAR(30);
BEGIN
    -- Get current order status
    SELECT status INTO current_order_status 
    FROM orders 
    WHERE id = order_uuid;
    
    -- Update payment status
    UPDATE orders 
    SET 
        payment_status = new_payment_status,
        payment_metadata = COALESCE(transaction_metadata, payment_metadata),
        updated_at = NOW()
    WHERE id = order_uuid;
    
    -- Auto-update order status based on payment status
    CASE new_payment_status
        WHEN 'confirmed' THEN
            -- Payment confirmed - move order to physician review if it was pending
            IF current_order_status = 'pending' THEN
                UPDATE orders 
                SET status = 'physician_review', updated_at = NOW()
                WHERE id = order_uuid;
            END IF;
            
        WHEN 'failed', 'cancelled', 'voided' THEN
            -- Payment failed - cancel order if it was pending
            IF current_order_status IN ('pending', 'physician_review') THEN
                UPDATE orders 
                SET status = 'cancelled', updated_at = NOW()
                WHERE id = order_uuid;
            END IF;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View for orders with payment information
CREATE VIEW orders_with_payment AS
SELECT 
    o.*,
    upm.card_last_four,
    upm.card_brand,
    upm.gateway_provider as payment_method_gateway
FROM orders o
LEFT JOIN user_payment_methods upm ON o.payment_method_id = upm.id;

-- View for pending payments (useful for monitoring)
CREATE VIEW pending_payments AS
SELECT 
    o.id as order_id,
    o.genie_transaction_id,
    o.total_amount,
    o.payment_status,
    o.created_at,
    up.first_name,
    up.last_name,
    -- Since products table was dropped, we'll use product_id directly from order_items
    -- Product names come from Genie API, not stored in our DB
    (SELECT string_agg(oi.product_id, ', ') 
     FROM order_items oi 
     WHERE oi.order_id = o.id) as product_ids
FROM orders o
JOIN user_profiles up ON o.user_id = up.id
WHERE o.payment_status IN ('pending', 'authorized')
ORDER BY o.created_at DESC;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN orders.payment_method_id IS 'Reference to stored payment method used for this order';
COMMENT ON COLUMN orders.genie_transaction_id IS 'Genie Business transaction ID for payment tracking and webhook correlation';
COMMENT ON COLUMN orders.payment_status IS 'Current payment status independent of order fulfillment status';
COMMENT ON COLUMN orders.payment_gateway IS 'Payment gateway used for processing (genie_business, dialog_ipg, etc.)';
COMMENT ON COLUMN orders.payment_metadata IS 'Gateway-specific payment data from webhooks and API responses';

COMMENT ON VIEW orders_with_payment IS 'Orders joined with payment method details for easy querying';
COMMENT ON VIEW pending_payments IS 'Orders with pending or authorized payments that need monitoring';

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
USAGE EXAMPLES:

-- Create order with payment method
INSERT INTO orders (
    user_id, 
    health_vertical_id, 
    total_amount, 
    delivery_address,
    payment_method_id,
    genie_transaction_id,
    payment_status
) VALUES (
    'user-uuid-here',
    'vertical-uuid-here',
    2500.00,
    '{"street": "123 Main St", "city": "Colombo", "postcode": "00100"}'::jsonb,
    'payment-method-uuid-here',
    'genie-transaction-id-123',
    'pending'
);

-- Update payment status when webhook received
SELECT update_order_payment_status(
    'order-uuid-here',
    'confirmed',
    '{"gateway_reference": "genie-ref-123", "confirmed_at": "2023-12-01T10:00:00Z"}'::jsonb
);

-- Find order by Genie transaction ID (for webhook processing)
SELECT * FROM orders WHERE genie_transaction_id = 'transaction-id-from-webhook';

-- Get orders with payment details
SELECT * FROM orders_with_payment 
WHERE user_id = 'user-uuid-here' 
ORDER BY created_at DESC;

-- Monitor pending payments
SELECT * FROM pending_payments;

-- Create order items with Genie product IDs
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
VALUES 
    ('order-uuid-here', '6888fa5ae4b41311603613c9', 1, 2500.00, 2500.00),
    ('order-uuid-here', '6888fa5ae4b41311603613ca', 2, 1500.00, 3000.00);

-- Update payment method's last used timestamp when order is created
UPDATE user_payment_methods 
SET last_used_at = NOW(), updated_at = NOW()
WHERE id = 'payment-method-uuid-used-in-order';
*/