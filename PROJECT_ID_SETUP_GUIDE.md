# Project ID-Based Environment Detection

## 🎯 **Bulletproof Solution for Separate Cloud Projects**

This approach uses your actual Supabase project references to automatically detect whether it's running in dev or prod environment.

## How It Works

1. **Project Registration**: Each project is registered in a database table with its environment
2. **Automatic Detection**: Functions detect the current project ID and look up its environment
3. **Smart Fallbacks**: Multiple detection methods ensure it always works

## Setup Instructions

### Step 1: Deploy Migrations to Both Projects

```bash
# Deploy to dev project
npx supabase link --project-ref your-dev-project-ref
npx supabase db push

# Deploy to prod project  
npx supabase link --project-ref your-prod-project-ref
npx supabase db push
```

### Step 2: Find Your Project References

Your project references are the 20-character strings in your Supabase URLs:
- Dev: `https://your-dev-project-ref.supabase.co`
- Prod: `https://your-prod-project-ref.supabase.co`

### Step 3: Register Your Projects

Run this SQL on **each project** to register it:

**On DEV project:**
```sql
SELECT register_project_environment('your-dev-project-ref', 'dev', 'Development environment');
```

**On PROD project:**
```sql  
SELECT register_project_environment('your-prod-project-ref', 'prod', 'Production environment');
```

### Step 4: Verify Setup

Check the registration worked:
```sql
-- See current project info
SELECT 
  get_current_project_ref() as current_project,
  (SELECT environment FROM project_environment_config 
   WHERE project_ref = get_current_project_ref()) as environment;

-- See all registered projects
SELECT * FROM project_environment_config;
```

## Adding New Products

Now you can add products with different IDs per environment:

```sql
-- This automatically uses correct ID based on project
SELECT insert_product_metadata_env_aware(
  'new_product',
  'dev_genie_id_123',      -- Used in dev project
  'prod_genie_id_456',     -- Used in prod project  
  'hair-loss',
  false,
  true,
  'Active Ingredient',
  'Dosage instructions',
  '["benefit1", "benefit2"]'::jsonb,
  'How it works',
  'Timeline',
  '["side effects"]'::jsonb,
  '["contraindications"]'::jsonb,
  '["warnings"]'::jsonb
);
```

## Benefits

✅ **100% Bulletproof**: Uses actual project IDs, no guessing  
✅ **Zero Configuration**: No environment variables to manage  
✅ **Automatic Detection**: Works without any setup after registration  
✅ **Multiple Fallbacks**: Always finds the right environment  
✅ **Version Controlled**: Everything tracked in git  

## Detection Methods (in order)

1. **Project Registration Table**: Looks up project in `project_environment_config`
2. **Direct Project Match**: Compares against provided project refs
3. **Manual Setting**: Falls back to `app.environment` setting
4. **Safe Default**: Defaults to 'dev' if all else fails

## Example Migration

```sql
-- 019_add_vitamin_d_spray.sql
SELECT insert_product_metadata_env_aware(
  'vitamin_d_spray',
  'dev_vitamin_d_abc123',
  'prod_vitamin_d_xyz789',
  'hair-loss',
  false,
  false,
  'Vitamin D3 1000IU',
  'Spray once daily on scalp',
  '["Supports hair follicle health", "Corrects vitamin D deficiency"]'::jsonb,
  'Vitamin D3 supports healthy hair growth cycle',
  'Improvements after 6-8 weeks',
  '["None reported"]'::jsonb,
  '["Vitamin D allergy"]'::jsonb,
  '["Do not exceed recommended dose"]'::jsonb
);
```

Then deploy to both projects:
```bash
npx supabase db push  # Works on both dev and prod!
```

## Troubleshooting

**Q: Environment detection isn't working?**
A: Check project registration:
```sql
SELECT * FROM project_environment_config;
-- If empty, run the registration commands above
```

**Q: How do I find my project reference?**  
A: 
```sql
SELECT get_current_project_ref();
-- Or check your Supabase dashboard URL
```

**Q: Can I change a project's environment?**
A: Yes:
```sql
SELECT register_project_environment('project-ref', 'new-env', 'Updated description');
```