-- Simple migration: Rename prescription_required to consultation_required in product_metadata table
-- Drop the unused products table

-- ============================================================================
-- 1. DROP UNUSED PRODUCTS TABLE
-- ============================================================================

-- Remove the old products table since we use product_metadata instead
DROP TABLE IF EXISTS products CASCADE;

-- ============================================================================
-- 2. RENAME FIELD IN PRODUCT_METADATA TABLE
-- ============================================================================

-- Rename prescription_required to consultation_required for consistency
ALTER TABLE product_metadata 
RENAME COLUMN prescription_required TO consultation_required;

-- ============================================================================
-- 3. UPDATE COMMENTS
-- ============================================================================

COMMENT ON COLUMN product_metadata.consultation_required IS 'Whether this product requires a consultation before purchase (renamed from prescription_required)';

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

/*
This migration makes a simple change:

1. Drops the unused `products` table since we use `product_metadata` instead
2. Renames `prescription_required` to `consultation_required` in `product_metadata` table for better naming

The existing workflow remains the same:
- Product details come from Genie API using genie_product_id
- Additional metadata comes from product_metadata table  
- Health vertical info comes from the health_verticals relationship
- Cart will store health_vertical_slug from the relationship

No breaking changes to the API or existing functionality.
*/