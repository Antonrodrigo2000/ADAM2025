-- ============================================================================
-- Two-Phase Payment System: Consultation + Product Payments
-- Migration: 022_consultation_payment_flow
-- ============================================================================

-- Add consultation-specific fields to orders table
ALTER TABLE orders 
ADD COLUMN payment_flow_type VARCHAR(30) DEFAULT 'consultation_first';
-- Values: consultation_first, full_upfront

ALTER TABLE orders 
ADD COLUMN consultation_payment_id VARCHAR(100);  -- Genie transaction ID for consultation

ALTER TABLE orders 
ADD COLUMN consultation_status VARCHAR(30) DEFAULT 'pending';
-- Values: pending, paid, approved, rejected

ALTER TABLE orders 
ADD COLUMN consultation_fee_total DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE orders 
ADD COLUMN product_payment_id VARCHAR(100);  -- Genie transaction ID for products

ALTER TABLE orders 
ADD COLUMN product_payment_status VARCHAR(30) DEFAULT 'pending';
-- Values: pending, authorized, paid, failed

ALTER TABLE orders 
ADD COLUMN physician_notes TEXT;

ALTER TABLE orders 
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE orders 
ADD COLUMN approved_by UUID REFERENCES user_profiles(id);  -- Doctor who approved

-- ============================================================================
-- PAYMENT PHASES TRACKING TABLE
-- ============================================================================

-- Track individual payment phases for complete audit trail
CREATE TABLE order_payment_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    
    -- Phase identification
    phase_type VARCHAR(30) NOT NULL, -- consultation, products
    phase_status VARCHAR(30) DEFAULT 'pending',
    -- Values: pending, processing, completed, failed, cancelled
    
    -- Genie transaction details
    genie_transaction_id VARCHAR(100),
    payment_method_id UUID REFERENCES user_payment_methods(id),
    
    -- Financial details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'LKR',
    
    -- Processing details
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    payment_metadata JSONB,
    error_details TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES AND CONSTRAINTS
-- ============================================================================

-- Consultation flow constraints
ALTER TABLE orders 
ADD CONSTRAINT orders_payment_flow_type_check 
CHECK (payment_flow_type IN ('consultation_first', 'full_upfront'));

ALTER TABLE orders 
ADD CONSTRAINT orders_consultation_status_check 
CHECK (consultation_status IN ('pending', 'paid', 'approved', 'rejected'));

ALTER TABLE orders 
ADD CONSTRAINT orders_product_payment_status_check 
CHECK (product_payment_status IN ('pending', 'authorized', 'paid', 'failed'));

-- Payment phases constraints
ALTER TABLE order_payment_phases 
ADD CONSTRAINT payment_phases_type_check 
CHECK (phase_type IN ('consultation', 'products'));

ALTER TABLE order_payment_phases 
ADD CONSTRAINT payment_phases_status_check 
CHECK (phase_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'));

-- Indexes for performance
CREATE INDEX idx_orders_consultation_payment_id ON orders(consultation_payment_id) WHERE consultation_payment_id IS NOT NULL;
CREATE INDEX idx_orders_product_payment_id ON orders(product_payment_id) WHERE product_payment_id IS NOT NULL;
CREATE INDEX idx_orders_consultation_status ON orders(consultation_status);
CREATE INDEX idx_orders_flow_type ON orders(payment_flow_type);

CREATE INDEX idx_payment_phases_order_id ON order_payment_phases(order_id);
CREATE INDEX idx_payment_phases_genie_transaction ON order_payment_phases(genie_transaction_id) WHERE genie_transaction_id IS NOT NULL;
CREATE INDEX idx_payment_phases_type_status ON order_payment_phases(phase_type, phase_status);

-- ============================================================================
-- CONSULTATION FLOW MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to create consultation payment phase
CREATE OR REPLACE FUNCTION create_consultation_payment_phase(
    order_uuid UUID,
    consultation_amount DECIMAL(10,2),
    payment_method_uuid UUID,
    genie_trans_id VARCHAR(100)
)
RETURNS UUID AS $$
DECLARE
    phase_id UUID;
BEGIN
    -- Insert payment phase record
    INSERT INTO order_payment_phases (
        order_id,
        phase_type,
        amount,
        payment_method_id,
        genie_transaction_id,
        phase_status
    ) VALUES (
        order_uuid,
        'consultation',
        consultation_amount,
        payment_method_uuid,
        genie_trans_id,
        'processing'
    ) RETURNING id INTO phase_id;
    
    -- Update order with consultation details
    UPDATE orders 
    SET 
        consultation_payment_id = genie_trans_id,
        consultation_fee_total = consultation_amount,
        payment_method_id = payment_method_uuid,
        updated_at = NOW()
    WHERE id = order_uuid;
    
    RETURN phase_id;
END;
$$ LANGUAGE plpgsql;

-- Function to handle consultation payment confirmation
CREATE OR REPLACE FUNCTION confirm_consultation_payment(
    genie_trans_id VARCHAR(100),
    payment_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    order_record orders%ROWTYPE;
    phase_id UUID;
BEGIN
    -- Find the order and payment phase
    SELECT * INTO order_record 
    FROM orders 
    WHERE consultation_payment_id = genie_trans_id;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Order not found for consultation payment: %', genie_trans_id;
        RETURN FALSE;
    END IF;
    
    -- Update payment phase to completed
    UPDATE order_payment_phases 
    SET 
        phase_status = 'completed',
        completed_at = NOW(),
        payment_metadata = COALESCE(payment_metadata, payment_metadata),
        updated_at = NOW()
    WHERE genie_transaction_id = genie_trans_id 
    AND phase_type = 'consultation'
    RETURNING id INTO phase_id;
    
    -- Update order consultation status
    UPDATE orders 
    SET 
        consultation_status = 'paid',
        payment_status = 'consultation_paid',
        status = 'physician_review',
        updated_at = NOW()
    WHERE id = order_record.id;
    
    RAISE NOTICE 'Consultation payment confirmed for order: %', order_record.id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to approve consultation and prepare product payment
CREATE OR REPLACE FUNCTION approve_consultation(
    order_uuid UUID,
    physician_id UUID,
    notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    product_amount DECIMAL(10,2);
BEGIN
    -- Calculate product amount (total - consultation fee)
    SELECT (total_amount - consultation_fee_total) INTO product_amount
    FROM orders 
    WHERE id = order_uuid;
    
    -- Update order with approval
    UPDATE orders 
    SET 
        consultation_status = 'approved',
        approved_at = NOW(),
        approved_by = physician_id,
        physician_notes = notes,
        status = 'approved_pending_payment',
        updated_at = NOW()
    WHERE id = order_uuid;
    
    -- Create product payment phase (ready for payment processing)
    INSERT INTO order_payment_phases (
        order_id,
        phase_type,
        amount,
        phase_status
    ) VALUES (
        order_uuid,
        'products',
        product_amount,
        'pending'
    );
    
    RAISE NOTICE 'Consultation approved for order: %. Product payment amount: %', order_uuid, product_amount;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CONSULTATION WORKFLOW VIEWS
-- ============================================================================

-- Orders pending consultation payment
CREATE VIEW orders_pending_consultation AS
SELECT 
    o.id,
    o.consultation_payment_id,
    o.consultation_fee_total,
    o.consultation_status,
    o.created_at,
    up.first_name,
    up.last_name,
    au.email
FROM orders o
JOIN user_profiles up ON o.user_id = up.id
JOIN auth.users au ON o.user_id = au.id
WHERE o.payment_flow_type = 'consultation_first'
AND o.consultation_status = 'pending'
ORDER BY o.created_at ASC;

-- Orders ready for physician review
CREATE VIEW orders_for_physician_review AS
SELECT 
    o.id,
    o.user_id,
    o.consultation_fee_total,
    o.total_amount,
    (o.total_amount - o.consultation_fee_total) as product_amount,
    o.created_at,
    up.first_name,
    up.last_name,
    au.email,
    -- Get product details from order_items
    (SELECT json_agg(json_build_object(
        'product_id', oi.product_id,
        'quantity', oi.quantity,
        'unit_price', oi.unit_price
    )) FROM order_items oi WHERE oi.order_id = o.id) as products
FROM orders o
JOIN user_profiles up ON o.user_id = up.id
JOIN auth.users au ON o.user_id = au.id
WHERE o.payment_flow_type = 'consultation_first'
AND o.consultation_status = 'paid'
AND o.status = 'physician_review'
ORDER BY o.created_at ASC;

-- Orders approved and pending product payment
CREATE VIEW orders_pending_product_payment AS
SELECT 
    o.id,
    o.user_id,
    o.payment_method_id,
    (o.total_amount - o.consultation_fee_total) as product_amount,
    o.approved_at,
    o.approved_by,
    up.first_name,
    up.last_name,
    au.email
FROM orders o
JOIN user_profiles up ON o.user_id = up.id
JOIN auth.users au ON o.user_id = au.id
WHERE o.payment_flow_type = 'consultation_first'
AND o.consultation_status = 'approved'
AND o.product_payment_status = 'pending'
ORDER BY o.approved_at ASC;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN orders.payment_flow_type IS 'Type of payment flow: consultation_first or full_upfront';
COMMENT ON COLUMN orders.consultation_payment_id IS 'Genie transaction ID for consultation payment phase';
COMMENT ON COLUMN orders.consultation_status IS 'Status of consultation: pending, paid, approved, rejected';
COMMENT ON COLUMN orders.product_payment_id IS 'Genie transaction ID for product payment phase';

COMMENT ON TABLE order_payment_phases IS 'Tracks individual payment phases (consultation, products) for complete audit trail';
COMMENT ON VIEW orders_for_physician_review IS 'Orders with paid consultations awaiting physician review and approval';
COMMENT ON VIEW orders_pending_product_payment IS 'Approved orders ready for product payment processing';

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
CONSULTATION FLOW EXAMPLE:

1. Create order for consultation flow:
INSERT INTO orders (user_id, health_vertical_id, total_amount, consultation_fee_total, payment_flow_type, delivery_address)
VALUES ('user-id', 'vertical-id', 2500.00, 500.00, 'consultation_first', '{"address": "data"}'::jsonb);

2. Create consultation payment phase:
SELECT create_consultation_payment_phase(
    'order-uuid',
    500.00,
    'payment-method-uuid',
    'genie-consultation-transaction-id'
);

3. Confirm consultation payment (from webhook):
SELECT confirm_consultation_payment('genie-consultation-transaction-id', '{"confirmed_at": "2023-12-01"}'::jsonb);

4. Physician approves consultation:
SELECT approve_consultation('order-uuid', 'physician-uuid', 'Patient approved for treatment');

5. Process product payment:
-- This would be handled by your payment processing service
-- Create Genie transaction for remaining amount (total - consultation fee)

6. Monitor workflow:
SELECT * FROM orders_pending_consultation;
SELECT * FROM orders_for_physician_review;  
SELECT * FROM orders_pending_product_payment;
*/