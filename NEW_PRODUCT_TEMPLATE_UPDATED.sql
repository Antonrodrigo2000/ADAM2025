-- ============================================================================
-- UPDATED PRODUCT TEMPLATE - Use this for adding new products
-- Copy this template and replace placeholders with actual values
-- ============================================================================

-- EXAMPLE 1: NORMAL PRODUCT (OTC, direct purchase)
SELECT insert_product_metadata_env_aware(
    'product_key_here',              -- Internal product key (lowercase, underscores)
    'dev_genie_product_id_here',     -- Dev Genie product ID
    'prod_genie_product_id_here',    -- Prod Genie product ID
    'hair-loss',                     -- Health vertical slug (hair-loss, erectile-dysfunction, etc.)
    false,                           -- consultation_required (false for normal products)
    'Active Ingredient Name',        -- active_ingredient
    'Application instructions',      -- dosage
    '["Benefit 1", "Benefit 2", "Benefit 3"]'::jsonb,  -- benefits
    'How the product works explanation',     -- how_it_works
    'Timeline for expected results',         -- expected_timeline
    '["Side effect 1", "Side effect 2"]'::jsonb,       -- side_effects
    '["Contraindication 1", "Contraindication 2"]'::jsonb,  -- contraindications
    '["Warning 1", "Warning 2"]'::jsonb,    -- warnings
    NULL,                            -- dev_project_ref (optional)
    NULL,                            -- prod_project_ref (optional)
    'normal',                        -- product_type (NEW FIELD)
    false                            -- is_adhoc_quantity (NEW FIELD)
);

-- EXAMPLE 2: CONSULTATION REQUIRED PRODUCT (needs doctor approval, fixed dosage)
SELECT insert_product_metadata_env_aware(
    'consultation_product_key',
    'dev_genie_id_consultation',
    'prod_genie_id_consultation',
    'hair-loss',
    true,                            -- consultation_required = true
    'Prescription Active Ingredient',
    'Fixed dosage as per guidelines',
    '["Clinical benefit 1", "Clinical benefit 2"]'::jsonb,
    'Medical explanation of mechanism',
    'Clinical timeline expectations',
    '["Medical side effect 1", "Medical side effect 2"]'::jsonb,
    '["Medical contraindication 1", "Medical contraindication 2"]'::jsonb,
    '["Prescription warning 1", "Prescription warning 2"]'::jsonb,
    NULL,
    NULL,
    'consultation_required',         -- product_type (NEW FIELD)
    false                            -- is_adhoc_quantity = false (fixed dosage)
);

-- EXAMPLE 3: CONSULTATION ADHOC PRODUCT (doctor determines quantity/dosage)
SELECT insert_product_metadata_env_aware(
    'adhoc_product_key',
    'dev_genie_id_adhoc',
    'prod_genie_id_adhoc',
    'hair-loss',
    true,                            -- consultation_required = true
    'Variable Dose Active Ingredient',
    'Variable dosage as prescribed by physician',  -- Note: Variable dosage
    '["Personalized treatment", "Doctor-optimized dosing"]'::jsonb,
    'Physician determines optimal dosing based on patient needs',
    'Results timeline varies based on prescribed dose',
    '["Dose-dependent side effects", "Variable side effects"]'::jsonb,
    '["Medical contraindications", "Dose-specific contraindications"]'::jsonb,
    '["Follow physician instructions", "Do not adjust dose without consultation"]'::jsonb,
    NULL,
    NULL,
    'consultation_adhoc',            -- product_type (NEW FIELD)
    true                             -- is_adhoc_quantity = true (doctor decides)
);

-- ============================================================================
-- INGREDIENT EXAMPLES (use existing function)
-- ============================================================================

-- Add ingredients for the new product
SELECT insert_product_ingredients_env_aware(
    'product_key_here',
    'dev_genie_product_id_here',
    'prod_genie_product_id_here',
    '[
        {"name": "Ingredient 1", "dosage": "5%", "description": "Primary active ingredient", "display_order": 1},
        {"name": "Ingredient 2", "dosage": "2%", "description": "Supporting ingredient", "display_order": 2}
    ]'::jsonb
);

-- ============================================================================
-- CLINICAL STUDIES EXAMPLES (use existing function)
-- ============================================================================

SELECT insert_product_studies_env_aware(
    'product_key_here',
    'dev_genie_product_id_here',
    'prod_genie_product_id_here',
    '[
        {"title": "Clinical Study Title", "description": "Study description", "efficacy_rate": 85, "display_order": 1}
    ]'::jsonb
);

-- ============================================================================
-- FAQ EXAMPLES (use existing function)
-- ============================================================================

SELECT insert_product_faqs_env_aware(
    'product_key_here',
    'dev_genie_product_id_here',
    'prod_genie_product_id_here',
    '[
        {"question": "Common question?", "answer": "Helpful answer", "display_order": 1},
        {"question": "Another question?", "answer": "Another answer", "display_order": 2}
    ]'::jsonb
);

-- ============================================================================
-- PRODUCT TYPE DECISION GUIDE
-- ============================================================================

/*
WHEN TO USE EACH PRODUCT TYPE:

1. NORMAL ('normal'):
   - Over-the-counter products
   - User can purchase directly without prescription
   - Fixed quantities/dosages available
   - Examples: Minoxidil topical, vitamins, shampoos
   - Consent UI: "I agree to purchase these products"

2. CONSULTATION REQUIRED ('consultation_required'):
   - Prescription products with standard dosing
   - Doctor reviews and approves/denies
   - Fixed quantities and standard dosing protocols
   - Examples: Standard Finasteride 1mg tablets, combination sprays
   - Consent UI: "I agree to the consultation process and fees"

3. CONSULTATION ADHOC ('consultation_adhoc'):
   - Prescription products with variable/custom dosing
   - Doctor determines exact quantity, dosage, or formulation
   - Pricing may vary based on doctor's prescription
   - Examples: Custom compounded medications, variable tablet quantities
   - Consent UI: "I agree to doctor-determined quantities and variable pricing"

PAYMENT FLOW MAPPING:
- normal products: Can use 'full_upfront' OR 'consultation_first'
- consultation_required products: Must use 'consultation_first'
- consultation_adhoc products: Must use 'consultation_first'
*/

-- ============================================================================
-- VERIFICATION QUERY (run after adding products)
-- ============================================================================

/*
-- Check your newly added products:
SELECT 
    pm.genie_product_id,
    pm.product_type,
    pm.is_adhoc_quantity,
    pm.prescription_required,
    pm.active_ingredient,
    hv.slug as health_vertical
FROM product_metadata pm
JOIN health_verticals hv ON pm.health_vertical_id = hv.id
WHERE pm.genie_product_id IN ('your_dev_id', 'your_prod_id')
ORDER BY pm.product_type;
*/