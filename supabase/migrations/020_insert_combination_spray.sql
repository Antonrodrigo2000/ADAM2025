-- Insert combination spray product data using environment-aware functions
-- NOTE: Replace the prod genie_product_id with your actual production ID

SELECT insert_product_metadata_env_aware(
    'combination_spray',
    '68a1a04edf7091f06e094492',  -- dev genie_product_id
    '688e5929cae3f387ae515c8b',   -- prod genie_product_id (replace with actual)
    'hair-loss',
    true,   -- consultation_required
    'Minoxidil 5% + Finasteride 0.25%',
    'Apply once daily to affected areas',
    '["Dual-action formula for enhanced regrowth", "Combines topical Finasteride and Minoxidil", "Improved hair density and thickness"]'::jsonb,
    'Minoxidil improves blood flow and follicle stimulation, while topical Finasteride reduces DHT at the scalp to prevent further loss.',
    'Mild shedding may occur early on. Visible improvements often start between month 2 to 4.',
    '["Scalp irritation", "Reduced libido (rare with topical Finasteride)", "Itching or dryness"]'::jsonb,
    '["Pregnancy or breastfeeding", "Under 18 years", "Known hypersensitivity to Finasteride or Minoxidil"]'::jsonb,
    '["External use only", "Do not apply on broken skin", "Wash hands thoroughly after use"]'::jsonb
);

-- Add sample ingredients for Combination Spray
SELECT insert_product_ingredients_env_aware(
    'combination_spray',
    '68a1a04edf7091f06e094492',  -- dev genie_product_id
    '688e5929cae3f387ae515c8b',   -- prod genie_product_id (replace with actual)
    '[
        {"name": "Minoxidil", "dosage": "5%", "description": "Stimulates hair follicle activity and regrowth", "display_order": 1},
        {"name": "Finasteride", "dosage": "0.25%", "description": "Reduces scalp DHT to prevent hair loss", "display_order": 2},
        {"name": "Propylene Glycol", "dosage": "30%", "description": "Enhances absorption of active ingredients", "display_order": 3},
        {"name": "Ethanol", "dosage": "60%", "description": "Acts as a solvent and preserves formulation", "display_order": 4}
    ]'::jsonb
);

-- Add sample clinical studies for Combination Spray
SELECT insert_product_studies_env_aware(
    'combination_spray',
    '68a1a04edf7091f06e094492',  -- dev genie_product_id
    '688e5929cae3f387ae515c8b',   -- prod genie_product_id (replace with actual)
    '[
        {"title": "Topical Dual Therapy Study (2021)", "description": "Demonstrated improved efficacy with combination vs monotherapy", "efficacy_rate": 89, "display_order": 1},
        {"title": "Scalp DHT Suppression Trial", "description": "Topical finasteride showed local DHT reduction with minimal systemic exposure", "efficacy_rate": 82, "display_order": 2}
    ]'::jsonb
);

-- Add sample FAQs for Combination Spray
SELECT insert_product_faqs_env_aware(
    'combination_spray',
    '68a1a04edf7091f06e094492',  -- dev genie_product_id
    '688e5929cae3f387ae515c8b',   -- prod genie_product_id (replace with actual)
    '[
        {"question": "Why is this combination more effective?", "answer": "It targets both the hormonal and vascular causes of hair loss.", "display_order": 1},
        {"question": "Do I need a prescription?", "answer": "Yes, due to the presence of Finasteride, a prescription is required.", "display_order": 2},
        {"question": "Are there sexual side effects?", "answer": "Topical finasteride has a lower risk than oral forms, but rare cases have been reported.", "display_order": 3},
        {"question": "Can I use this if my partner is pregnant or we are trying to conceive?", "answer": "It is not recommended. Finasteride can be harmful to a developing fetus. Avoid use if your partner is pregnant or trying to conceive, and always consult your doctor before starting treatment.", "display_order": 4}
    ]'::jsonb
);