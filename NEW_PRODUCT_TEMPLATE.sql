-- TEMPLATE: Copy this for new product migrations
-- Replace ALL_CAPS placeholders with your actual values
-- 
-- This template works with separate cloud Supabase projects (dev and prod)
-- The functions automatically detect the environment and use the correct IDs

-- Step 1: Add product metadata
SELECT insert_product_metadata_env_aware(
  'PRODUCT_KEY',                    -- unique product identifier (lowercase, underscores)
  'DEV_GENIE_PRODUCT_ID',          -- development genie product id  
  'PROD_GENIE_PRODUCT_ID',         -- production genie product id
  'HEALTH_VERTICAL_SLUG',          -- e.g., 'hair-loss'
  CONSULTATION_REQUIRED,           -- true/false  
  'ACTIVE_INGREDIENT',             -- e.g., 'Minoxidil 5%'
  'DOSAGE_INSTRUCTIONS',           -- e.g., 'Apply twice daily'
  'BENEFITS_JSON'::jsonb,          -- e.g., '["benefit1", "benefit2"]'
  'HOW_IT_WORKS_TEXT',
  'EXPECTED_TIMELINE_TEXT', 
  'SIDE_EFFECTS_JSON'::jsonb,
  'CONTRAINDICATIONS_JSON'::jsonb,
  'WARNINGS_JSON'::jsonb,
  'YOUR_DEV_PROJECT_REF',          -- optional: your dev project reference
  'YOUR_PROD_PROJECT_REF'          -- optional: your prod project reference  
);

-- Step 2: Add ingredients (optional)
SELECT insert_product_ingredients_env_aware(
  'PRODUCT_KEY',
  'DEV_GENIE_PRODUCT_ID',
  'PROD_GENIE_PRODUCT_ID',
  '[
    {"name": "INGREDIENT_NAME", "dosage": "DOSAGE", "description": "DESCRIPTION", "display_order": 1},
    {"name": "INGREDIENT_NAME_2", "dosage": "DOSAGE_2", "description": "DESCRIPTION_2", "display_order": 2}
  ]'::jsonb,
  'YOUR_DEV_PROJECT_REF',          -- optional: your dev project reference
  'YOUR_PROD_PROJECT_REF'          -- optional: your prod project reference
);

-- Step 3: Add FAQs (optional)
SELECT insert_product_faqs_env_aware(
  'PRODUCT_KEY',
  'DEV_GENIE_PRODUCT_ID',
  'PROD_GENIE_PRODUCT_ID',
  '[
    {"question": "FAQ_QUESTION", "answer": "FAQ_ANSWER", "display_order": 1},
    {"question": "FAQ_QUESTION_2", "answer": "FAQ_ANSWER_2", "display_order": 2}
  ]'::jsonb,
  'YOUR_DEV_PROJECT_REF',          -- optional: your dev project reference
  'YOUR_PROD_PROJECT_REF'          -- optional: your prod project reference
);

-- Step 4: Add clinical studies (optional)
SELECT insert_product_studies_env_aware(
  'PRODUCT_KEY',
  'DEV_GENIE_PRODUCT_ID', 
  'PROD_GENIE_PRODUCT_ID',
  '[
    {"title": "STUDY_TITLE", "description": "STUDY_DESCRIPTION", "efficacy_rate": 85, "display_order": 1}
  ]'::jsonb,
  'YOUR_DEV_PROJECT_REF',          -- optional: your dev project reference
  'YOUR_PROD_PROJECT_REF'          -- optional: your prod project reference
);

-- Example Usage:
-- 1. Copy this file to supabase/migrations/XXX_add_YOUR_PRODUCT.sql
-- 2. Replace all placeholders with your actual values
-- 3. Run: npx supabase db push
-- 4. The migration will work on both dev and prod with correct IDs!