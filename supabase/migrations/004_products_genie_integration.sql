-- ============================================================================
-- ADAM Products - Genie Proxy Schema
-- Store only additional metadata not available in Genie API
-- Genie provides: id, name, description, price, images, stock, category
-- We store: consultation_fee, prescription_required, benefits, clinical data, etc.
-- ============================================================================

-- ============================================================================
-- 1. PRODUCT METADATA PROXY TABLE
-- ============================================================================

-- Store only the data NOT available in Genie API
CREATE TABLE product_metadata (
    -- Use Genie product ID as primary key reference
    genie_product_id VARCHAR(255) PRIMARY KEY,
    
    -- Health vertical mapping (not in Genie)
    health_vertical_id UUID REFERENCES health_verticals(id),
    
    -- Business logic fields (not in Genie)
    prescription_required BOOLEAN DEFAULT false,
    
    -- Enhanced product content (not in Genie)
    active_ingredient VARCHAR(200),
    dosage VARCHAR(200),
    
    -- Marketing content (not in Genie)
    benefits JSONB, -- string[]
    how_it_works TEXT,
    expected_timeline TEXT,
    side_effects JSONB, -- string[]
    contraindications JSONB, -- string[]
    warnings JSONB, -- string[]
    
    -- Review aggregation (not in Genie)
    rating DECIMAL(3,2) DEFAULT 4.60,
    review_count INTEGER DEFAULT 0,
    
    -- Admin fields
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. PRODUCT INGREDIENTS TABLE (not in Genie)
-- ============================================================================

CREATE TABLE product_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    genie_product_id VARCHAR(255) REFERENCES product_metadata(genie_product_id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. CLINICAL STUDIES TABLE (not in Genie)
-- ============================================================================

CREATE TABLE product_clinical_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    genie_product_id VARCHAR(255) REFERENCES product_metadata(genie_product_id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    efficacy_rate INTEGER, -- 0-100 percentage
    study_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. PRODUCT FAQS TABLE (not in Genie)
-- ============================================================================

CREATE TABLE product_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    genie_product_id VARCHAR(255) REFERENCES product_metadata(genie_product_id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. PRODUCT REVIEWS TABLE (not in Genie)
-- ============================================================================

CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    genie_product_id VARCHAR(255) REFERENCES product_metadata(genie_product_id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. PERFORMANCE INDEXES
-- ============================================================================

-- Product metadata indexes
CREATE INDEX idx_product_metadata_health_vertical ON product_metadata(health_vertical_id);
CREATE INDEX idx_product_metadata_active ON product_metadata(is_active);
CREATE INDEX idx_product_metadata_prescription ON product_metadata(prescription_required);
CREATE INDEX idx_product_metadata_rating ON product_metadata(rating DESC);

-- Product ingredients indexes
CREATE INDEX idx_product_ingredients_genie_id ON product_ingredients(genie_product_id, display_order);

-- Clinical studies indexes
CREATE INDEX idx_product_clinical_studies_genie_id ON product_clinical_studies(genie_product_id, display_order);

-- FAQs indexes
CREATE INDEX idx_product_faqs_genie_id ON product_faqs(genie_product_id, display_order);
CREATE INDEX idx_product_faqs_active ON product_faqs(is_active);

-- Reviews indexes
CREATE INDEX idx_product_reviews_genie_id ON product_reviews(genie_product_id);
CREATE INDEX idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_approved ON product_reviews(is_approved);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating DESC);

-- ============================================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on review tables
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Users can only see approved reviews or their own reviews
CREATE POLICY "Users can view approved reviews or their own" ON product_reviews
    FOR SELECT USING (is_approved = true OR user_id = auth.uid());

-- Users can only insert their own reviews
CREATE POLICY "Users can create their own reviews" ON product_reviews
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can only update their own reviews
CREATE POLICY "Users can update their own reviews" ON product_reviews
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function to update product rating based on reviews
CREATE OR REPLACE FUNCTION update_product_rating(genie_product_id_param VARCHAR(255))
RETURNS VOID AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    total_reviews INTEGER;
BEGIN
    SELECT 
        ROUND(AVG(rating)::numeric, 2),
        COUNT(*)
    INTO avg_rating, total_reviews
    FROM product_reviews 
    WHERE genie_product_id = genie_product_id_param 
    AND is_approved = true;
    
    UPDATE product_metadata 
    SET 
        rating = COALESCE(avg_rating, 4.60),
        review_count = total_reviews,
        updated_at = NOW()
    WHERE genie_product_id = genie_product_id_param;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product rating when reviews change
CREATE OR REPLACE FUNCTION trigger_update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_product_rating(NEW.genie_product_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_product_rating(OLD.genie_product_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION trigger_update_product_rating();

-- ============================================================================
-- 9. UPDATE TRIGGERS
-- ============================================================================

-- Add updated_at trigger
CREATE TRIGGER update_product_metadata_updated_at 
    BEFORE UPDATE ON product_metadata 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at 
    BEFORE UPDATE ON product_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. HEALTH VERTICALS SETUP
-- ============================================================================

-- Insert sample hair loss vertical if it doesn't exist
INSERT INTO health_verticals (name, slug, description, is_active)
VALUES ('Hair Loss', 'hair-loss', 'Hair loss treatment and prevention', true)
ON CONFLICT (slug) DO NOTHING;

-- NOTE: Sample product data has been moved to migrations 019 and 020
-- This ensures the environment-aware functions exist before product insertion

-- ============================================================================
-- USAGE NOTES
-- ============================================================================

/*
This migration creates a PROXY approach for Genie integration:

ARCHITECTURE:
- Genie API provides: id, name, description, price, images, stock, category
- Supabase stores: consultation_fee, prescription_required, benefits, clinical data, FAQs, reviews

WORKFLOW:
1. Fetch product from Genie API using product ID
2. Fetch additional metadata from Supabase using same product ID
3. Merge data to create complete Product interface object

BENEFITS:
- No data duplication
- Always fresh price/stock from Genie
- Rich metadata stored in Supabase
- Scales efficiently

EXAMPLE API CALL:
1. GET /api/products?name=minoxidil
2. Fetch from Genie API
3. JOIN with product_metadata, ingredients, clinical_studies, faqs
4. Return merged Product interface

To use this migration:
1. Run: supabase db push
2. Update your API routes to use this proxy approach
3. Add metadata for your Genie products
*/