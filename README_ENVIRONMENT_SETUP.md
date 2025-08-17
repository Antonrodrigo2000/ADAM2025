# Environment-Agnostic Database Setup

## Overview
This project uses environment-aware database functions to handle different `genie_product_id` values between separate cloud Supabase projects (dev and prod).

## Setup Instructions

### 1. Initial Database Setup
Run migrations on both projects:

```bash
# Link to dev project
npx supabase link --project-ref your-dev-project-ref

# Push migrations (will auto-detect environment as 'dev')
npx supabase db push

# Link to prod project  
npx supabase link --project-ref your-prod-project-ref

# Push migrations (will auto-detect environment as 'prod')
npx supabase db push
```

### 2. Verify Environment Detection
After running migrations, check the environment was detected correctly:

```sql
SELECT current_setting('app.environment') as current_environment;
```

### 3. Manual Environment Setup (if needed)
If auto-detection fails, manually set the environment:

**On DEV project:**
```sql
SELECT set_config('app.environment', 'dev', false);
```

**On PROD project:**
```sql
SELECT set_config('app.environment', 'prod', false);
```

### 4. Adding New Products
Use the environment-aware functions in your migrations:

```sql
-- This automatically uses the correct genie_product_id for each environment
SELECT insert_product_metadata_env_aware(
  'new_product_key',
  'dev_genie_id_12345',      -- Will be used in dev project
  'prod_genie_id_67890',     -- Will be used in prod project
  'hair-loss',
  false,  -- prescription_required
  true,   -- consultation_required
  'Active Ingredient Name',
  'Dosage instructions',
  '["benefit1", "benefit2"]'::jsonb,
  'How it works description',
  'Expected timeline text',
  '["side effect"]'::jsonb,
  '["contraindication"]'::jsonb,
  '["warning"]'::jsonb
);
```

### 5. Example: Adding a New Product
Create a new migration file (e.g., `017_add_biotin_supplement.sql`):

```sql
-- Add Biotin Supplement with different IDs for dev and prod
SELECT insert_product_metadata_env_aware(
  'biotin_supplement',
  'dev_biotin_id_abc123',
  'prod_biotin_id_xyz789',
  'hair-loss',
  false,
  false,
  'Biotin 10mg',
  'Take 1 capsule daily with food',
  '["Supports hair growth", "Strengthens nails", "Improves hair texture"]'::jsonb,
  'Biotin is essential for keratin production, the protein that makes up hair.',
  'Improvements typically seen after 8-12 weeks of consistent use.',
  '["Mild nausea if taken on empty stomach"]'::jsonb,
  '["Biotin allergy", "Pregnancy (consult doctor)"]'::jsonb,
  '["Store in cool, dry place", "Keep out of reach of children"]'::jsonb
);

-- Add ingredients
SELECT insert_product_ingredients_env_aware(
  'biotin_supplement',
  'dev_biotin_id_abc123',
  'prod_biotin_id_xyz789',
  '[
    {"name": "Biotin", "dosage": "10mg", "description": "Essential B-vitamin for hair health", "display_order": 1},
    {"name": "Microcrystalline Cellulose", "dosage": "50mg", "description": "Capsule filler", "display_order": 2}
  ]'::jsonb
);
```

Then run the migration:
```bash
npx supabase db push
```

## How It Works

1. **Environment Detection**: Each project auto-detects its environment based on database name patterns or manual configuration
2. **Smart ID Selection**: Functions automatically choose the correct `genie_product_id` based on the detected environment
3. **Single Migration**: Write one migration that works on both projects with different IDs
4. **No Manual Switching**: No need to change environment variables or configuration files

## Benefits

✅ **Single Migration Files**: One migration works on both dev and prod  
✅ **Automatic Detection**: Environment is detected automatically  
✅ **No Manual Switching**: No need to change configs between deployments  
✅ **Cloud Native**: Works with separate cloud Supabase projects  
✅ **Version Controlled**: All product data and logic tracked in git

## Files Structure

- `014_environment_aware_product_functions.sql`: Core environment-aware functions
- `015_add_new_product_example.sql`: Example of adding a new product
- `016_set_environment_config.sql`: Auto-detects and sets environment
- `NEW_PRODUCT_TEMPLATE.sql`: Template for adding new products