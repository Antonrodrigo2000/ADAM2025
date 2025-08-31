-- ============================================================================
-- Update Environment-Aware Product Functions with Product Types
-- Migration: 030_update_product_functions_with_types
-- ============================================================================

-- ============================================================================
-- 1. UPDATE PRODUCT METADATA FUNCTION WITH NEW FIELDS
-- ============================================================================

-- Drop and recreate the function with new product type parameters
DROP FUNCTION IF EXISTS insert_product_metadata_env_aware(
  TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, JSONB, TEXT, TEXT, JSONB, JSONB, JSONB, TEXT, TEXT
);

-- Updated function with product_type and is_adhoc_quantity parameters
CREATE OR REPLACE FUNCTION insert_product_metadata_env_aware(
  product_key TEXT,
  dev_genie_id TEXT,
  prod_genie_id TEXT,
  health_vertical_slug TEXT,
  consultation_required BOOLEAN DEFAULT false,
  active_ingredient TEXT DEFAULT NULL,
  dosage TEXT DEFAULT NULL,
  benefits JSONB DEFAULT NULL,
  how_it_works TEXT DEFAULT NULL,
  expected_timeline TEXT DEFAULT NULL,
  side_effects JSONB DEFAULT NULL,
  contraindications JSONB DEFAULT NULL,
  warnings JSONB DEFAULT NULL,
  dev_project_ref TEXT DEFAULT NULL,
  prod_project_ref TEXT DEFAULT NULL,
  -- NEW PARAMETERS
  product_type VARCHAR(30) DEFAULT 'normal',
  is_adhoc_quantity BOOLEAN DEFAULT false
) RETURNS TEXT AS $$
DECLARE
  genie_id TEXT;
  vertical_id UUID;
BEGIN
  -- Get environment-specific genie_product_id using new project ID detection
  -- Fall back to old method if new function doesn't exist yet
  BEGIN
    genie_id := get_env_genie_id_v2(product_key, dev_genie_id, prod_genie_id, dev_project_ref, prod_project_ref);
  EXCEPTION
    WHEN undefined_function THEN
      -- Fallback to old method if v2 function not available
      genie_id := get_env_genie_id(product_key, dev_genie_id, prod_genie_id);
  END;
  
  -- Get health vertical ID
  SELECT id INTO vertical_id 
  FROM health_verticals 
  WHERE slug = health_vertical_slug;
  
  IF vertical_id IS NULL THEN
    RAISE EXCEPTION 'Health vertical not found: %', health_vertical_slug;
  END IF;
  
  -- Validate product_type
  IF product_type NOT IN ('normal', 'consultation_required', 'consultation_adhoc') THEN
    RAISE EXCEPTION 'Invalid product_type: %. Must be normal, consultation_required, or consultation_adhoc', product_type;
  END IF;
  
  -- Insert product metadata with new fields
  INSERT INTO product_metadata (
    genie_product_id,
    health_vertical_id,
    consultation_required,
    active_ingredient,
    dosage,
    benefits,
    how_it_works,
    expected_timeline,
    side_effects,
    contraindications,
    warnings,
    product_type,
    is_adhoc_quantity
  ) VALUES (
    genie_id,
    vertical_id,
    consultation_required,
    active_ingredient,
    dosage,
    benefits,
    how_it_works,
    expected_timeline,
    side_effects,
    contraindications,
    warnings,
    product_type,
    is_adhoc_quantity
  ) 
  ON CONFLICT (genie_product_id) 
  DO UPDATE SET
    health_vertical_id = EXCLUDED.health_vertical_id,
    consultation_required = EXCLUDED.consultation_required,
    active_ingredient = EXCLUDED.active_ingredient,
    dosage = EXCLUDED.dosage,
    benefits = EXCLUDED.benefits,
    how_it_works = EXCLUDED.how_it_works,
    expected_timeline = EXCLUDED.expected_timeline,
    side_effects = EXCLUDED.side_effects,
    contraindications = EXCLUDED.contraindications,
    warnings = EXCLUDED.warnings,
    product_type = EXCLUDED.product_type,
    is_adhoc_quantity = EXCLUDED.is_adhoc_quantity,
    updated_at = NOW();
  
  RETURN genie_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. CREATE NEW PRODUCT TEMPLATE FILE
-- ============================================================================

-- This will be referenced in your workflow documentation