-- ADAM Telehealth Platform - Supabase Database Schema
-- Scalable architecture for multiple health verticals

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CORE USER MANAGEMENT
-- ============================================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50), 
    date_of_birth DATE,
    phone VARCHAR(20),
    address JSONB, -- Flexible address structure
    preferences JSONB, -- Notification preferences, etc.
    verification_status VARCHAR(20) DEFAULT 'pending', -- pending, partial, verified
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. HEALTH VERTICALS & CLINICAL CONTENT
-- ============================================================================

-- Health treatment verticals (hair-loss, ED, skincare, etc.)
CREATE TABLE health_verticals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL, -- hair-loss, erectile-dysfunction
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    requires_age_verification BOOLEAN DEFAULT true,
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 70,
    metadata JSONB, -- Additional vertical-specific config
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dynamic questionnaires per health vertical
CREATE TABLE questionnaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    health_vertical_id UUID REFERENCES health_verticals(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flexible questions structure
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20), -- single_choice, multiple_choice, text, number, date
    options JSONB, -- For choice questions: ["Option 1", "Option 2"]
    validation_rules JSONB, -- {"required": true, "min": 18, "max": 70}
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    conditional_logic JSONB, -- Show question based on previous answers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User responses to questionnaires
CREATE TABLE user_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    questionnaire_id UUID REFERENCES questionnaires(id),
    responses JSONB NOT NULL, -- {"age": 28, "family_history": "yes", ...}
    risk_score INTEGER, -- Calculated risk score 0-100
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- ============================================================================
-- 3. PRODUCTS & TREATMENT ALGORITHMS  
-- ============================================================================

-- ADAM branded products per vertical
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    health_vertical_id UUID REFERENCES health_verticals(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    active_ingredient VARCHAR(100),
    dosage VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    prescription_required BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    images JSONB, -- Array of image URLs
    metadata JSONB, -- Additional product data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treatment decision algorithms
CREATE TABLE treatment_algorithms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    health_vertical_id UUID REFERENCES health_verticals(id),
    name VARCHAR(200) NOT NULL,
    conditions JSONB NOT NULL, -- Logic for when this algorithm applies
    recommendations JSONB NOT NULL, -- Product IDs and messages
    contraindications JSONB, -- When to avoid this treatment
    requires_physician BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1, -- Algorithm execution order
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. E-COMMERCE & ORDERS
-- ============================================================================

-- Customer orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    health_vertical_id UUID REFERENCES health_verticals(id),
    status VARCHAR(30) DEFAULT 'pending', -- pending, physician_review, approved, shipped, completed, cancelled
    total_amount DECIMAL(10,2) NOT NULL,
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    delivery_address JSONB NOT NULL,
    delivery_method VARCHAR(30) DEFAULT 'standard', -- standard, express
    estimated_delivery DATE,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual items in each order
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    metadata JSONB
);

-- Payment records with Dialog IPG integration
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    payment_token VARCHAR(255), -- Dialog IPG token for delayed charging
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'LKR',
    status VARCHAR(20) DEFAULT 'pending', -- pending, tokenized, charged, failed, refunded
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB, -- Full Dialog IPG response
    charged_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. PHYSICIAN WORKFLOW & CONSULTATIONS
-- ============================================================================

-- Licensed physicians in the platform
CREATE TABLE physicians (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    medical_license_number VARCHAR(50) UNIQUE NOT NULL,
    specializations TEXT[], -- ["Dermatology", "Trichology"]
    health_verticals UUID[], -- Array of vertical IDs they can treat
    max_daily_cases INTEGER DEFAULT 10,
    consultation_fee DECIMAL(10,2) DEFAULT 2000.00,
    is_active BOOLEAN DEFAULT true,
    availability_schedule JSONB, -- Working hours and days
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultation records
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    physician_id UUID REFERENCES physicians(id),
    user_response_id UUID REFERENCES user_responses(id),
    status VARCHAR(30) DEFAULT 'assigned', -- assigned, in_progress, requires_call, completed, cancelled
    consultation_type VARCHAR(20) DEFAULT 'async', -- async, video_call, phone_call
    physician_notes TEXT,
    prescription_details JSONB,
    decision VARCHAR(20), -- approved, denied, requires_consultation
    scheduled_call_at TIMESTAMP WITH TIME ZONE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    sla_deadline TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '48 hours')
);

-- Physician queue management
CREATE TABLE physician_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    physician_id UUID REFERENCES physicians(id),
    priority INTEGER DEFAULT 1, -- 1=highest, 5=lowest
    queue_position INTEGER,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. AUDIT & TRACKING
-- ============================================================================

-- System audit log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order status tracking
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    notes TEXT,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================================================

-- User profiles
CREATE INDEX idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX idx_user_profiles_verification ON user_profiles(verification_status);

-- Health verticals & questionnaires
CREATE INDEX idx_health_verticals_slug ON health_verticals(slug);
CREATE INDEX idx_questionnaires_vertical ON questionnaires(health_vertical_id);
CREATE INDEX idx_questions_questionnaire ON questions(questionnaire_id, order_index);

-- User responses
CREATE INDEX idx_user_responses_user ON user_responses(user_id);
CREATE INDEX idx_user_responses_questionnaire ON user_responses(questionnaire_id);
CREATE INDEX idx_user_responses_completed ON user_responses(completed_at);

-- Products & algorithms
CREATE INDEX idx_products_vertical ON products(health_vertical_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_treatment_algorithms_vertical ON treatment_algorithms(health_vertical_id);

-- Orders & payments
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Consultations & queue
CREATE INDEX idx_consultations_order ON consultations(order_id);
CREATE INDEX idx_consultations_physician ON consultations(physician_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_sla ON consultations(sla_deadline);
CREATE INDEX idx_physician_queue_physician ON physician_queue(physician_id);
CREATE INDEX idx_physician_queue_priority ON physician_queue(priority, queue_position);

-- Audit & tracking
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- User profiles - users can only see/edit their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- User responses - users can only see their own responses
CREATE POLICY "Users can view their own responses" ON user_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses" ON user_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Orders - users can only see their own orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items - users can only see items from their orders
CREATE POLICY "Users can view their own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Payments - users can only see their own payments
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = payments.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Consultations - users can see their own consultations, physicians can see assigned ones
CREATE POLICY "Users can view their own consultations" ON consultations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = consultations.order_id 
            AND orders.user_id = auth.uid()
        )
        OR physician_id = auth.uid()
    );

-- Physicians can update their assigned consultations
CREATE POLICY "Physicians can update assigned consultations" ON consultations
    FOR UPDATE USING (physician_id = auth.uid());

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create order status history entry
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (order_id, status, updated_by)
        VALUES (NEW.id, NEW.status, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_order_status_changes
    AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- Function to assign next available physician
CREATE OR REPLACE FUNCTION assign_next_available_physician(
    vertical_id UUID,
    consultation_id UUID
) RETURNS UUID AS $$
DECLARE
    assigned_physician_id UUID;
BEGIN
    -- Find physician with lowest current workload for this vertical
    SELECT p.id INTO assigned_physician_id
    FROM physicians p
    LEFT JOIN consultations c ON p.id = c.physician_id 
        AND c.status IN ('assigned', 'in_progress')
        AND c.assigned_at >= CURRENT_DATE
    WHERE p.is_active = true 
        AND vertical_id = ANY(p.health_verticals)
    GROUP BY p.id, p.max_daily_cases
    HAVING COUNT(c.id) < p.max_daily_cases
    ORDER BY COUNT(c.id) ASC, RANDOM()
    LIMIT 1;
    
    -- Update consultation with assigned physician
    IF assigned_physician_id IS NOT NULL THEN
        UPDATE consultations 
        SET physician_id = assigned_physician_id,
            assigned_at = NOW()
        WHERE id = consultation_id;
        
        -- Add to physician queue
        INSERT INTO physician_queue (consultation_id, physician_id, priority)
        VALUES (consultation_id, assigned_physician_id, 1);
    END IF;
    
    RETURN assigned_physician_id;
END;
$$ LANGUAGE plpgsql;