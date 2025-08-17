-- Insert initial product data using environment-aware functions
-- This migration runs after 014 (functions) and 017 (project detection)

-- Sample product metadata for a Genie product using environment-aware functions
-- NOTE: Replace the prod genie_product_id with your actual production ID
SELECT insert_product_metadata_env_aware(
    'minoxidil_5_percent',
    '68a1a00ddf7091f06e094491',  -- dev genie_product_id
    '6888fa5ae4b41311603613c9',    -- prod genie_product_id (replace with actual)
    'hair-loss',
    false,  -- consultation_required
    'Minoxidil 5%',
    'Apply twice daily to affected areas',
    '["Clinically proven hair regrowth", "FDA approved formula", "Visible results in 3-4 months"]'::jsonb,
    'Minoxidil works by widening blood vessels and opening potassium channels, allowing more oxygen, blood, and nutrients to the follicle.',
    'Initial shedding may occur in weeks 2-6. New hair growth typically begins around month 3-4.',
    '["Scalp irritation", "Unwanted facial hair growth", "Dizziness (rare)"]'::jsonb,
    '["Pregnancy or breastfeeding", "Under 18 years of age", "Scalp infections"]'::jsonb,
    '["For external use only", "Avoid contact with eyes", "Wash hands after application"]'::jsonb
);

-- Add sample ingredients
SELECT insert_product_ingredients_env_aware(
    'minoxidil_5_percent',
    '68a1a00ddf7091f06e094491',  -- dev genie_product_id
    '6888fa5ae4b41311603613c9',    -- prod genie_product_id (replace with actual)
    '[
        {"name": "Minoxidil", "dosage": "5%", "description": "Vasodilator that improves blood flow to hair follicles", "display_order": 1},
        {"name": "Propylene Glycol", "dosage": "30%", "description": "Enhances absorption of active ingredients", "display_order": 2},
        {"name": "Ethanol", "dosage": "60%", "description": "Acts as a solvent and preserves formulation", "display_order": 3}
    ]'::jsonb
);

-- Add sample clinical studies
SELECT insert_product_studies_env_aware(
    'minoxidil_5_percent',
    '68a1a00ddf7091f06e094491',  -- dev genie_product_id
    '6888fa5ae4b41311603613c9',    -- prod genie_product_id (replace with actual)
    '[
        {"title": "FDA Clinical Trial (1988)", "description": "Demonstrated significant hair regrowth in male pattern baldness", "efficacy_rate": 85, "display_order": 1},
        {"title": "Multi-center Study (2019)", "description": "Confirmed efficacy in both men and women with androgenetic alopecia", "efficacy_rate": 78, "display_order": 2}
    ]'::jsonb
);

-- Add sample FAQs
SELECT insert_product_faqs_env_aware(
    'minoxidil_5_percent',
    '68a1a00ddf7091f06e094491',  -- dev genie_product_id
    '6888fa5ae4b41311603613c9',    -- prod genie_product_id (replace with actual)
    '[
        {"question": "How long does it take to see results?", "answer": "Most users see initial results after 3-4 months of consistent use.", "display_order": 1},
        {"question": "Can I use this with other hair loss treatments?", "answer": "Yes, minoxidil can be combined with other treatments like finasteride.", "display_order": 2},
        {"question": "What happens if I stop using it?", "answer": "Hair loss will resume within 3-4 months of discontinuation.", "display_order": 3},
        {"question": "Is it safe for women?", "answer": "Yes, but women should use the 2% formulation unless prescribed 5% by a doctor.", "display_order": 4}
    ]'::jsonb
);