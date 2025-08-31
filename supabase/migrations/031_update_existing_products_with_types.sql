-- ============================================================================
-- Update Existing Products with Product Types and Consent Classifications
-- Migration: 031_update_existing_products_with_types
-- ============================================================================

-- ============================================================================
-- 1. UPDATE MINOXIDIL 5% (NORMAL PRODUCT)
-- ============================================================================

-- Minoxidil 5% - OTC product, user can purchase directly
UPDATE product_metadata 
SET 
    product_type = 'normal',
    is_adhoc_quantity = false,
    updated_at = NOW()
WHERE genie_product_id IN (
    '68a1a00ddf7091f06e094491',  -- dev environment
    '6888fa5ae4b41311603613c9'   -- prod environment  
);

-- ============================================================================
-- 2. UPDATE COMBINATION SPRAY (CONSULTATION REQUIRED)
-- ============================================================================

-- Combination Spray (Minoxidil + Finasteride) - Requires consultation, fixed dosage
UPDATE product_metadata 
SET 
    product_type = 'consultation_required',
    is_adhoc_quantity = false,
    updated_at = NOW()
WHERE genie_product_id IN (
    '68a1a04edf7091f06e094492',  -- dev environment
    '688e5929cae3f387ae515c8b'   -- prod environment
);

-- ============================================================================
-- 3. VERIFICATION - LOG UPDATES
-- ============================================================================

DO $$
DECLARE
    minoxidil_count INTEGER;
    combination_count INTEGER;
BEGIN
    -- Count updated minoxidil products
    SELECT COUNT(*) INTO minoxidil_count
    FROM product_metadata 
    WHERE genie_product_id IN ('68a1a00ddf7091f06e094491', '6888fa5ae4b41311603613c9')
    AND product_type = 'normal';
    
    -- Count updated combination products  
    SELECT COUNT(*) INTO combination_count
    FROM product_metadata 
    WHERE genie_product_id IN ('68a1a04edf7091f06e094492', '688e5929cae3f387ae515c8b')
    AND product_type = 'consultation_required';
    
    RAISE NOTICE 'Updated % Minoxidil products to normal type', minoxidil_count;
    RAISE NOTICE 'Updated % Combination Spray products to consultation_required type', combination_count;
END $$;

-- ============================================================================
-- 4. DISPLAY CURRENT PRODUCT CLASSIFICATION
-- ============================================================================

-- Show all products with their classifications
DO $$
DECLARE
    product_record RECORD;
BEGIN
    RAISE NOTICE '=== CURRENT PRODUCT CLASSIFICATIONS ===';
    
    FOR product_record IN 
        SELECT 
            pm.genie_product_id,
            pm.product_type,
            pm.is_adhoc_quantity,
            pm.consultation_required,
            pm.active_ingredient,
            hv.slug as health_vertical
        FROM product_metadata pm
        JOIN health_verticals hv ON pm.health_vertical_id = hv.id
        ORDER BY pm.product_type, pm.genie_product_id
    LOOP
        RAISE NOTICE 'Product: % | Type: % | Adhoc: % | Consultation: % | Vertical: %', 
            product_record.genie_product_id,
            product_record.product_type,
            product_record.is_adhoc_quantity,
            product_record.consultation_required,
            product_record.health_vertical;
    END LOOP;
END $$;

-- ============================================================================
-- 5. FUTURE PRODUCT EXAMPLES (for reference)
-- ============================================================================

-- When adding new products, use these patterns:

-- EXAMPLE: Finasteride Tablets (Consultation Adhoc - Doctor determines quantity)
/*
SELECT insert_product_metadata_env_aware(
    'finasteride_tablets',
    'dev_genie_product_id_here',
    'prod_genie_product_id_here',
    'hair-loss',
    true,   -- consultation_required (will be updated to consultation_adhoc below)
    'Finasteride 1mg',
    'As prescribed by physician',
    '["Blocks DHT production", "Prevents further hair loss", "May promote regrowth"]'::jsonb,
    'Finasteride inhibits 5-alpha-reductase, reducing DHT levels that cause male pattern baldness.',
    'Hair loss stabilization typically seen within 6 months. Regrowth may occur after 12+ months.',
    '["Decreased libido", "Erectile dysfunction", "Depression (rare)"]'::jsonb,
    '["Women of childbearing age", "Liver disease", "Prostate cancer"]'::jsonb,
    '["Take with or without food", "Crush tablets - pregnant women should not handle broken tablets"]'::jsonb
);

-- Then update to adhoc type:
UPDATE product_metadata 
SET 
    product_type = 'consultation_adhoc',
    is_adhoc_quantity = true,
    dosage = 'Variable quantity as prescribed by physician',
    updated_at = NOW()
WHERE genie_product_id IN ('dev_genie_product_id_here', 'prod_genie_product_id_here');
*/

-- ============================================================================
-- 6. CONSENT REQUIREMENTS SUMMARY
-- ============================================================================

/*
CONSENT REQUIREMENTS BY PRODUCT TYPE:

1. MINOXIDIL 5% (normal):
   - UI Checkbox: "I agree to purchase these products"
   - Payment Flow: Can use either 'full_upfront' or 'consultation_first'
   - User Action: Direct purchase

2. COMBINATION SPRAY (consultation_required):  
   - UI Checkbox: "I agree to the consultation process and fees"
   - Payment Flow: Must use 'consultation_first' 
   - User Action: Pay consultation → Doctor approval → Product payment

3. FUTURE ADHOC PRODUCTS (consultation_adhoc):
   - UI Checkbox: "I agree to doctor-determined quantities and variable pricing"
   - Payment Flow: Must use 'consultation_first'
   - User Action: Pay consultation → Doctor prescribes quantity → Variable product payment

CART ANALYSIS:
- If cart contains ANY consultation products → consultation_consent required
- If cart contains ANY adhoc products → adhoc_pricing_consent required  
- If cart contains ANY normal products → normal_products_consent required
*/