-- Insert sample product metadata for Combination Spray
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
    '688e5929cae3f387ae515c8b',
    (SELECT id FROM health_verticals WHERE slug = 'hair-loss'),
    true,
    'Minoxidil 5% + Finasteride 0.25%',
    'Apply once daily to affected areas',
    '["Dual-action formula for enhanced regrowth", "Combines topical Finasteride and Minoxidil", "Improved hair density and thickness"]'::jsonb,
    'Minoxidil improves blood flow and follicle stimulation, while topical Finasteride reduces DHT at the scalp to prevent further loss.',
    'Mild shedding may occur early on. Visible improvements often start between month 2 to 4.',
    '["Scalp irritation", "Reduced libido (rare with topical Finasteride)", "Itching or dryness"]'::jsonb,
    '["Pregnancy or breastfeeding", "Under 18 years", "Known hypersensitivity to Finasteride or Minoxidil"]'::jsonb,
    '["External use only", "Do not apply on broken skin", "Wash hands thoroughly after use"]'::jsonb
) ON CONFLICT (genie_product_id) DO NOTHING;

-- Add sample ingredients for Combination Spray
INSERT INTO product_ingredients (genie_product_id, name, dosage, description, display_order)
VALUES 
    ('688e5929cae3f387ae515c8b', 'Minoxidil', '5%', 'Stimulates hair follicle activity and regrowth', 1),
    ('688e5929cae3f387ae515c8b', 'Finasteride', '0.25%', 'Reduces scalp DHT to prevent hair loss', 2),
    ('688e5929cae3f387ae515c8b', 'Propylene Glycol', '30%', 'Enhances absorption of active ingredients', 3),
    ('688e5929cae3f387ae515c8b', 'Ethanol', '60%', 'Acts as a solvent and preserves formulation', 4)
ON CONFLICT DO NOTHING;

-- Add sample clinical studies for Combination Spray
INSERT INTO product_clinical_studies (genie_product_id, title, description, efficacy_rate, display_order)
VALUES 
    ('688e5929cae3f387ae515c8b', 'Topical Dual Therapy Study (2021)', 'Demonstrated improved efficacy with combination vs monotherapy', 89, 1),
    ('688e5929cae3f387ae515c8b', 'Scalp DHT Suppression Trial', 'Topical finasteride showed local DHT reduction with minimal systemic exposure', 82, 2)
ON CONFLICT DO NOTHING;

-- Add sample FAQs for Combination Spray
INSERT INTO product_faqs (genie_product_id, question, answer, display_order)
VALUES 
    ('688e5929cae3f387ae515c8b', 'Why is this combination more effective?', 'It targets both the hormonal and vascular causes of hair loss.', 1),
    ('688e5929cae3f387ae515c8b', 'Do I need a prescription?', 'Yes, due to the presence of Finasteride, a prescription is required.', 2),
    ('688e5929cae3f387ae515c8b', 'Are there sexual side effects?', 'Topical finasteride has a lower risk than oral forms, but rare cases have been reported.', 3),
    ('688e5929cae3f387ae515c8b', 'Can I use this if my partner is pregnant or we’re trying to conceive?', 'It is not recommended. Finasteride can be harmful to a developing fetus. Avoid use if your partner is pregnant or trying to conceive, and always consult your doctor before starting treatment.', 4)
ON CONFLICT DO NOTHING;