-- ============================================================================
-- Product Types and User Consent Tracking System
-- Migration: 029_add_product_types_and_consent_tracking
-- ============================================================================

-- ============================================================================
-- 1. ADD PRODUCT TYPE CLASSIFICATION TO PRODUCT_METADATA
-- ============================================================================

-- Add product type field to classify products
ALTER TABLE product_metadata 
ADD COLUMN product_type VARCHAR(30) DEFAULT 'normal';
-- Values: normal, consultation_required, consultation_adhoc

-- Add flag to indicate if quantity/dosage is determined by doctor (adhoc pricing)
ALTER TABLE product_metadata 
ADD COLUMN is_adhoc_quantity BOOLEAN DEFAULT false;

-- Add constraint for valid product types
ALTER TABLE product_metadata 
ADD CONSTRAINT product_metadata_product_type_check 
CHECK (product_type IN ('normal', 'consultation_required', 'consultation_adhoc'));

-- ============================================================================
-- 2. ADD USER CONSENT TRACKING TO ORDERS TABLE
-- ============================================================================

-- Normal products consent (user agrees to pay for normal products)
ALTER TABLE orders 
ADD COLUMN normal_products_consent BOOLEAN DEFAULT false;

ALTER TABLE orders 
ADD COLUMN normal_products_consent_at TIMESTAMP WITH TIME ZONE;

-- Consultation flow consent (user agrees to consultation process and fees)
ALTER TABLE orders 
ADD COLUMN consultation_consent BOOLEAN DEFAULT false;

ALTER TABLE orders 
ADD COLUMN consultation_consent_at TIMESTAMP WITH TIME ZONE;

-- Adhoc pricing consent (user agrees to doctor-determined quantities and pricing)
ALTER TABLE orders 
ADD COLUMN adhoc_pricing_consent BOOLEAN DEFAULT false;

ALTER TABLE orders 
ADD COLUMN adhoc_pricing_consent_at TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Product metadata indexes
CREATE INDEX idx_product_metadata_product_type ON product_metadata(product_type);
CREATE INDEX idx_product_metadata_adhoc_quantity ON product_metadata(is_adhoc_quantity) WHERE is_adhoc_quantity = true;

-- Orders consent indexes (for reporting and compliance)
CREATE INDEX idx_orders_normal_consent ON orders(normal_products_consent) WHERE normal_products_consent = true;
CREATE INDEX idx_orders_consultation_consent ON orders(consultation_consent) WHERE consultation_consent = true;
CREATE INDEX idx_orders_adhoc_consent ON orders(adhoc_pricing_consent) WHERE adhoc_pricing_consent = true;

-- ============================================================================
-- 4. HELPER FUNCTIONS FOR CART ANALYSIS
-- ============================================================================

-- Function to analyze cart contents and determine required consents
CREATE OR REPLACE FUNCTION analyze_cart_consent_requirements(
    cart_items JSONB
)
RETURNS TABLE(
    has_normal_products BOOLEAN,
    has_consultation_products BOOLEAN,
    has_adhoc_products BOOLEAN,
    normal_products_count INTEGER,
    consultation_products_count INTEGER,
    adhoc_products_count INTEGER
) AS $$
DECLARE
    item JSONB;
    product_metadata_record RECORD;
    normal_count INTEGER := 0;
    consultation_count INTEGER := 0;
    adhoc_count INTEGER := 0;
BEGIN
    -- Loop through cart items
    FOR item IN SELECT * FROM jsonb_array_elements(cart_items)
    LOOP
        -- Get product metadata for each item
        SELECT pm.product_type, pm.is_adhoc_quantity 
        INTO product_metadata_record
        FROM product_metadata pm 
        WHERE pm.genie_product_id = (item->>'product_id');
        
        -- Count products by type
        IF product_metadata_record.product_type = 'normal' THEN
            normal_count := normal_count + 1;
        ELSIF product_metadata_record.product_type = 'consultation_required' THEN
            consultation_count := consultation_count + 1;
        ELSIF product_metadata_record.product_type = 'consultation_adhoc' THEN
            adhoc_count := adhoc_count + 1;
        END IF;
    END LOOP;
    
    -- Return analysis results
    RETURN QUERY SELECT 
        normal_count > 0 as has_normal_products,
        consultation_count > 0 as has_consultation_products,
        adhoc_count > 0 as has_adhoc_products,
        normal_count as normal_products_count,
        consultation_count as consultation_products_count,
        adhoc_count as adhoc_products_count;
END;
$$ LANGUAGE plpgsql;

-- Function to validate all required consents are provided
CREATE OR REPLACE FUNCTION validate_order_consents(
    order_uuid UUID
)
RETURNS TABLE(
    is_valid BOOLEAN,
    missing_consents TEXT[]
) AS $$
DECLARE
    order_record orders%ROWTYPE;
    cart_analysis RECORD;
    missing_list TEXT[] := '{}';
BEGIN
    -- Get order details
    SELECT * INTO order_record FROM orders WHERE id = order_uuid;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false as is_valid, ARRAY['Order not found'] as missing_consents;
        RETURN;
    END IF;
    
    -- Analyze cart contents
    SELECT * INTO cart_analysis 
    FROM analyze_cart_consent_requirements(order_record.cart_snapshot);
    
    -- Check required consents based on cart contents
    IF cart_analysis.has_normal_products AND NOT order_record.normal_products_consent THEN
        missing_list := array_append(missing_list, 'normal_products_consent');
    END IF;
    
    IF cart_analysis.has_consultation_products AND NOT order_record.consultation_consent THEN
        missing_list := array_append(missing_list, 'consultation_consent');
    END IF;
    
    IF cart_analysis.has_adhoc_products AND NOT order_record.adhoc_pricing_consent THEN
        missing_list := array_append(missing_list, 'adhoc_pricing_consent');
    END IF;
    
    -- Return validation results
    RETURN QUERY SELECT 
        array_length(missing_list, 1) IS NULL as is_valid,
        missing_list as missing_consents;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. VIEWS FOR CONSENT REPORTING
-- ============================================================================

-- View for orders with consent status
CREATE VIEW orders_with_consent_status AS
SELECT 
    o.id,
    o.user_id,
    o.status,
    o.created_at,
    
    -- Consent status
    o.normal_products_consent,
    o.normal_products_consent_at,
    o.consultation_consent,
    o.consultation_consent_at,
    o.adhoc_pricing_consent,
    o.adhoc_pricing_consent_at,
    
    -- Cart analysis
    (SELECT has_normal_products FROM analyze_cart_consent_requirements(o.cart_snapshot)) as requires_normal_consent,
    (SELECT has_consultation_products FROM analyze_cart_consent_requirements(o.cart_snapshot)) as requires_consultation_consent,
    (SELECT has_adhoc_products FROM analyze_cart_consent_requirements(o.cart_snapshot)) as requires_adhoc_consent,
    
    -- Validation
    (SELECT is_valid FROM validate_order_consents(o.id)) as all_consents_valid,
    (SELECT missing_consents FROM validate_order_consents(o.id)) as missing_consents
    
FROM orders o
WHERE o.cart_snapshot IS NOT NULL;

-- View for products by type
CREATE VIEW products_by_type AS
SELECT 
    pm.genie_product_id,
    pm.product_type,
    pm.is_adhoc_quantity,
    pm.consultation_required,
    hv.name as health_vertical_name,
    hv.slug as health_vertical_slug
FROM product_metadata pm
JOIN health_verticals hv ON pm.health_vertical_id = hv.id
WHERE pm.is_active = true
ORDER BY pm.product_type, pm.genie_product_id;

-- ============================================================================
-- 6. TRIGGERS FOR AUTOMATIC CONSENT TIMESTAMP UPDATES
-- ============================================================================

-- Function to update consent timestamps when consent flags change
CREATE OR REPLACE FUNCTION update_consent_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- Update normal products consent timestamp
    IF OLD.normal_products_consent IS DISTINCT FROM NEW.normal_products_consent AND NEW.normal_products_consent = true THEN
        NEW.normal_products_consent_at = NOW();
    END IF;
    
    -- Update consultation consent timestamp
    IF OLD.consultation_consent IS DISTINCT FROM NEW.consultation_consent AND NEW.consultation_consent = true THEN
        NEW.consultation_consent_at = NOW();
    END IF;
    
    -- Update adhoc pricing consent timestamp
    IF OLD.adhoc_pricing_consent IS DISTINCT FROM NEW.adhoc_pricing_consent AND NEW.adhoc_pricing_consent = true THEN
        NEW.adhoc_pricing_consent_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to orders table
CREATE TRIGGER update_orders_consent_timestamps
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_consent_timestamps();

-- ============================================================================
-- 7. COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN product_metadata.product_type IS 'Product classification: normal, consultation_required, consultation_adhoc';
COMMENT ON COLUMN product_metadata.is_adhoc_quantity IS 'True if doctor determines quantity/dosage (affects pricing)';

COMMENT ON COLUMN orders.normal_products_consent IS 'User consent to pay for normal products';
COMMENT ON COLUMN orders.normal_products_consent_at IS 'Timestamp when normal products consent was given';
COMMENT ON COLUMN orders.consultation_consent IS 'User consent for consultation process and fees';
COMMENT ON COLUMN orders.consultation_consent_at IS 'Timestamp when consultation consent was given';
COMMENT ON COLUMN orders.adhoc_pricing_consent IS 'User consent for doctor-determined quantities and pricing';
COMMENT ON COLUMN orders.adhoc_pricing_consent_at IS 'Timestamp when adhoc pricing consent was given';

COMMENT ON FUNCTION analyze_cart_consent_requirements(JSONB) IS 'Analyzes cart contents to determine which consents are required';
COMMENT ON FUNCTION validate_order_consents(UUID) IS 'Validates that all required consents are provided for an order';

COMMENT ON VIEW orders_with_consent_status IS 'Orders with consent requirements and validation status';
COMMENT ON VIEW products_by_type IS 'Products classified by type for easy filtering';

-- ============================================================================
-- 8. SET DEFAULT VALUES FOR EXISTING PRODUCTS
-- ============================================================================

-- Set all existing products to 'normal' type by default
-- This ensures the migration works in all environments
UPDATE product_metadata 
SET 
    product_type = 'normal', 
    is_adhoc_quantity = false 
WHERE product_type IS NULL OR product_type = 'normal';

-- Log how many products were updated
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % existing products to normal type', updated_count;
END $$;

-- ============================================================================
-- 9. USAGE EXAMPLES
-- ============================================================================

/*
USAGE EXAMPLES:

1. Create order with consents:
INSERT INTO orders (
    user_id, 
    cart_snapshot, 
    normal_products_consent,
    consultation_consent,
    adhoc_pricing_consent,
    total_amount, 
    delivery_address
) VALUES (
    'user-uuid',
    '[{"product_id": "68a1a00ddf7091f06e094491", "quantity": 1, "price": 2500}]'::jsonb,
    true,  -- User agreed to pay for normal products
    false, -- No consultation products in cart
    false, -- No adhoc products in cart
    2500.00,
    '{"address": "data"}'::jsonb
);

2. Analyze cart requirements:
SELECT * FROM analyze_cart_consent_requirements(
    '[{"product_id": "68a1a00ddf7091f06e094491", "quantity": 1}]'::jsonb
);

3. Validate order consents:
SELECT * FROM validate_order_consents('order-uuid-here');

4. Get products by type:
SELECT * FROM products_by_type WHERE product_type = 'consultation_adhoc';

5. Monitor consent compliance:
SELECT * FROM orders_with_consent_status 
WHERE all_consents_valid = false;

6. Update product types:
UPDATE product_metadata 
SET product_type = 'consultation_adhoc', is_adhoc_quantity = true 
WHERE genie_product_id = 'product-id';
*/