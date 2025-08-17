-- Environment-aware functions for adding products with different IDs per environment
-- 
-- SETUP: These functions work with project ID-based detection (migration 017)
-- After deployment, register your projects:
-- DEV: SELECT register_project_environment('your-dev-ref', 'dev');
-- PROD: SELECT register_project_environment('your-prod-ref', 'prod');

-- Function to get environment-specific genie_product_id
CREATE OR REPLACE FUNCTION get_env_genie_id(
  product_key TEXT,
  dev_id TEXT DEFAULT NULL,
  prod_id TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  current_env TEXT;
BEGIN
  -- Get environment from database setting (set manually on each project)
  BEGIN
    current_env := current_setting('app.environment');
  EXCEPTION
    WHEN undefined_object THEN
      -- Fallback: Try to detect by database/project patterns
      SELECT CASE 
        WHEN current_database() ILIKE '%dev%' OR current_database() ILIKE '%staging%' THEN 'dev'
        WHEN current_database() ILIKE '%prod%' OR current_database() ILIKE '%production%' THEN 'prod'
        ELSE 'dev'  -- Default to dev if uncertain
      END INTO current_env;
  END;
  
  -- Return appropriate ID based on environment
  RETURN CASE 
    WHEN current_env = 'dev' THEN COALESCE(dev_id, product_key || '_dev')
    ELSE COALESCE(prod_id, product_key || '_prod')
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to safely insert product metadata with environment-specific IDs
-- Updated to use new project ID-based detection
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
  prod_project_ref TEXT DEFAULT NULL
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
  
  -- Insert product metadata
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
    warnings
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
    warnings
  ) ON CONFLICT (genie_product_id) DO NOTHING;
  
  RETURN genie_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add ingredients for a product
CREATE OR REPLACE FUNCTION insert_product_ingredients_env_aware(
  product_key TEXT,
  dev_genie_id TEXT,
  prod_genie_id TEXT,
  ingredients JSONB,
  dev_project_ref TEXT DEFAULT NULL,
  prod_project_ref TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  genie_id TEXT;
  ingredient JSONB;
BEGIN
  -- Use new project ID detection with fallback
  BEGIN
    genie_id := get_env_genie_id_v2(product_key, dev_genie_id, prod_genie_id, dev_project_ref, prod_project_ref);
  EXCEPTION
    WHEN undefined_function THEN
      genie_id := get_env_genie_id(product_key, dev_genie_id, prod_genie_id);
  END;
  
  FOR ingredient IN SELECT * FROM jsonb_array_elements(ingredients)
  LOOP
    INSERT INTO product_ingredients (
      genie_product_id,
      name,
      dosage,
      description,
      display_order
    ) VALUES (
      genie_id,
      ingredient->>'name',
      ingredient->>'dosage',
      ingredient->>'description',
      (ingredient->>'display_order')::INTEGER
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to add FAQs for a product
CREATE OR REPLACE FUNCTION insert_product_faqs_env_aware(
  product_key TEXT,
  dev_genie_id TEXT,
  prod_genie_id TEXT,
  faqs JSONB,
  dev_project_ref TEXT DEFAULT NULL,
  prod_project_ref TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  genie_id TEXT;
  faq JSONB;
BEGIN
  -- Use new project ID detection with fallback
  BEGIN
    genie_id := get_env_genie_id_v2(product_key, dev_genie_id, prod_genie_id, dev_project_ref, prod_project_ref);
  EXCEPTION
    WHEN undefined_function THEN
      genie_id := get_env_genie_id(product_key, dev_genie_id, prod_genie_id);
  END;
  
  FOR faq IN SELECT * FROM jsonb_array_elements(faqs)
  LOOP
    INSERT INTO product_faqs (
      genie_product_id,
      question,
      answer,
      display_order
    ) VALUES (
      genie_id,
      faq->>'question',
      faq->>'answer',
      (faq->>'display_order')::INTEGER
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to add clinical studies for a product
CREATE OR REPLACE FUNCTION insert_product_studies_env_aware(
  product_key TEXT,
  dev_genie_id TEXT,
  prod_genie_id TEXT,
  studies JSONB,
  dev_project_ref TEXT DEFAULT NULL,
  prod_project_ref TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  genie_id TEXT;
  study JSONB;
BEGIN
  -- Use new project ID detection with fallback
  BEGIN
    genie_id := get_env_genie_id_v2(product_key, dev_genie_id, prod_genie_id, dev_project_ref, prod_project_ref);
  EXCEPTION
    WHEN undefined_function THEN
      genie_id := get_env_genie_id(product_key, dev_genie_id, prod_genie_id);
  END;
  
  FOR study IN SELECT * FROM jsonb_array_elements(studies)
  LOOP
    INSERT INTO product_clinical_studies (
      genie_product_id,
      title,
      description,
      efficacy_rate,
      display_order
    ) VALUES (
      genie_id,
      study->>'title',
      study->>'description',
      (study->>'efficacy_rate')::INTEGER,
      (study->>'display_order')::INTEGER
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;