-- Hair Loss Treatment Algorithms Seed Data
-- Health Vertical ID: 38a32ad9-bf29-4ba0-84e4-21313bf71bea (Hair Loss)

-- 1. Age/Gender Exclusion - Immediate referral
INSERT INTO public.treatment_algorithms (
  id, 
  health_vertical_id, 
  name, 
  conditions, 
  recommendations, 
  contraindications, 
  requires_physician, 
  priority, 
  is_active
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '38a32ad9-bf29-4ba0-84e4-21313bf71bea',
  'Age/Gender Exclusion',
  '{
    "age": {"max": 17},
    "gender": ["Female"]
  }',
  '{
    "consultation_required": true,
    "message": "Treatment not suitable for your age/gender profile. Please consult with a dermatologist for appropriate care options.",
    "referral_type": "dermatologist"
  }',
  '{}',
  true,
  1,
  true
);

-- 2. Medical Contraindications - Absolute exclusions
INSERT INTO public.treatment_algorithms (
  id,
  health_vertical_id,
  name,
  conditions,
  recommendations,
  contraindications,
  requires_physician,
  priority,
  is_active
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '38a32ad9-bf29-4ba0-84e4-21313bf71bea',
  'Medical Contraindications',
  '{
    "age": {"min": 18},
    "gender": ["Male"],
    "medicalConditions": {
      "contains_any": [
        "Allergy to finasteride",
        "Allergy to minoxidil", 
        "Heart conditions",
        "Liver disease",
        "Scalp wounds or infections",
        "Pregnant woman in household"
      ]
    }
  }',
  '{
    "consultation_required": true,
    "message": "Based on your medical history, our treatments are not suitable for you. We recommend consulting with a dermatologist for alternative options.",
    "referral_type": "dermatologist",
    "alternatives": [
      "Dermatologist consultation",
      "Hair transplant evaluation",
      "Non-prescription hair care solutions"
    ]
  }',
  '{
    "absolute": [
      "Allergy to finasteride",
      "Allergy to minoxidil",
      "Severe cardiovascular disease",
      "Scalp wounds/infections",
      "Pregnancy in household"
    ]
  }',
  true,
  2,
  true
);

-- 3. Patchy Hair Loss Pattern - Requires specialist evaluation
INSERT INTO public.treatment_algorithms (
  id,
  health_vertical_id,
  name,
  conditions,
  recommendations,
  contraindications,
  requires_physician,
  priority,
  is_active
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '38a32ad9-bf29-4ba0-84e4-21313bf71bea',
  'Patchy Hair Loss - Specialist Required',
  '{
    "age": {"min": 18},
    "gender": ["Male"],
    "hairLossAreas": {
      "contains": "Patches of complete hair loss (bald spots)"
    }
  }',
  '{
    "consultation_required": true,
    "message": "Patchy hair loss may indicate alopecia areata or other conditions that require specialist evaluation. Please consult with a dermatologist.",
    "referral_type": "dermatologist"
  }',
  '{}',
  true,
  3,
  true
);

-- 4. Finasteride Contraindicated - Minoxidil 5% Only
INSERT INTO public.treatment_algorithms (
  id,
  health_vertical_id,
  name,
  conditions,
  recommendations,
  contraindications,
  requires_physician,
  priority,
  is_active
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '38a32ad9-bf29-4ba0-84e4-21313bf71bea',
  'Finasteride Contraindicated - Minoxidil Only',
  '{
    "age": {"min": 18, "max": 70},
    "gender": ["Male"],
    "hairLossAreas": {
      "contains_any": [
        "Temples (sides of forehead)",
        "Crown (top back of head)",
        "Overall thinning (hair getting thinner everywhere)"
      ]
    },
    "medicalConditions": {
      "contains_any": [
        "Liver disease",
        "Prostate cancer history"
      ],
      "not_contains": [
        "Allergy to minoxidil",
        "Heart conditions",
        "Scalp wounds or infections"
      ]
    }
  }',
  '{
    "product_recommendation": "minoxidil_5_standalone",
    "product_name": "ADAM Minoxidil 5% Topical Solution",
    "message": "Based on your medical history, we recommend starting with Minoxidil 5% treatment. This is a proven, safe option for your hair loss pattern.",
    "instructions": [
      "Apply 1ml twice daily to dry scalp",
      "Avoid washing hair for 4 hours after application",
      "Expect initial shedding (normal response)",
      "Results visible after 3-4 months"
    ],
    "consultation_fee": 1500,
    "prescription_required": false
  }',
  '{
    "finasteride_contraindicated": true
  }',
  false,
  4,
  true
);

-- 5. Combination Therapy - First Line Treatment (Mild to Moderate)
INSERT INTO public.treatment_algorithms (
  id,
  health_vertical_id,
  name,
  conditions,
  recommendations,
  contraindications,
  requires_physician,
  priority,
  is_active
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  '38a32ad9-bf29-4ba0-84e4-21313bf71bea',
  'Combination Therapy - First Line (Mild-Moderate)',
  '{
    "age": {"min": 18, "max": 50},
    "gender": ["Male"],
    "hairLossAreas": {
      "contains_any": [
        "Temples (sides of forehead)",
        "Crown (top back of head)",
        "Overall thinning (hair getting thinner everywhere)"
      ]
    },
    "hairLossOnset": {
      "contains_any": [
        "Less than 6 months ago",
        "6 months to 1 year ago",
        "1 to 5 years ago"
      ]
    },
    "commitment": ["Yes"],
    "medicalConditions": {
      "not_contains": [
        "Allergy to finasteride",
        "Allergy to minoxidil",
        "Heart conditions",
        "Liver disease",
        "Prostate cancer history",
        "Scalp wounds or infections",
        "Pregnant woman in household"
      ]
    }
  }',
  '{
    "product_recommendation": "minoxidil_finasteride_spray",
    "product_name": "ADAM Personalized Hair Growth Spray (Minoxidil 5% + Finasteride 0.25%)",
    "message": "You are an excellent candidate for our most effective treatment. This combination therapy offers the best results for male pattern hair loss.",
    "instructions": [
      "Apply 1ml twice daily to dry scalp",
      "Avoid washing hair for 4 hours after application",
      "Expect initial shedding (normal response)",
      "Results visible after 3-4 months",
      "Long-term commitment required for sustained results"
    ],
    "consultation_fee": 2500,
    "prescription_required": true,
    "side_effects_warning": "May cause temporary changes in libido or mood. These effects are typically reversible."
  }',
  '{}',
  true,
  5,
  true
);

-- 6. Advanced Hair Loss - Combination with Realistic Expectations
INSERT INTO public.treatment_algorithms (
  id,
  health_vertical_id,
  name,
  conditions,
  recommendations,
  contraindications,
  requires_physician,
  priority,
  is_active
) VALUES (
  '66666666-6666-6666-6666-666666666666',
  '38a32ad9-bf29-4ba0-84e4-21313bf71bea',
  'Advanced Hair Loss - Manage Expectations',
  '{
    "age": {"min": 18, "max": 65},
    "gender": ["Male"],
    "hairLossOnset": {
      "contains": "More than 5 years ago"
    },
    "familyHistory": ["Yes"],
    "commitment": ["Yes"],
    "medicalConditions": {
      "not_contains": [
        "Allergy to finasteride",
        "Allergy to minoxidil",
        "Heart conditions",
        "Liver disease",
        "Prostate cancer history",
        "Scalp wounds or infections",
        "Pregnant woman in household"
      ]
    }
  }',
  '{
    "product_recommendation": "minoxidil_finasteride_spray",
    "product_name": "ADAM Personalized Hair Growth Spray (Minoxidil 5% + Finasteride 0.25%)",
    "message": "While our treatment can help, it works best at preventing further loss rather than regrowing hair in advanced cases. We recommend realistic expectations and may suggest additional alternatives.",
    "instructions": [
      "Apply 1ml twice daily to dry scalp",
      "Primary goal: prevent further hair loss",
      "Some regrowth possible but limited in advanced cases",
      "Consider combining with hair transplant consultation"
    ],
    "consultation_fee": 2500,
    "prescription_required": true,
    "alternatives_suggested": true,
    "additional_recommendations": [
      "Hair transplant consultation",
      "Cosmetic solutions (hair fibers, etc.)",
      "Scalp micropigmentation"
    ]
  }',
  '{}',
  true,
  6,
  true
);

-- 7. Low Commitment/Unrealistic Expectations
INSERT INTO public.treatment_algorithms (
  id,
  health_vertical_id,
  name,
  conditions,
  recommendations,
  contraindications,
  requires_physician,
  priority,
  is_active
) VALUES (
  '77777777-7777-7777-7777-777777777777',
  '38a32ad9-bf29-4ba0-84e4-21313bf71bea',
  'Low Commitment - Alternative Recommendations',
  '{
    "age": {"min": 18},
    "gender": ["Male"],
    "commitment": ["No"]
  }',
  '{
    "consultation_required": false,
    "message": "Hair loss treatment requires long-term commitment (minimum 6 months) to see results. We recommend non-prescription alternatives that may be more suitable for your preferences.",
    "alternatives": [
      "OTC Minoxidil 2% or 5% (available at pharmacies)",
      "Hair growth supplements (Biotin, Saw Palmetto)",
      "Scalp massage and proper hair care",
      "Cosmetic solutions (hair fibers, concealers)"
    ],
    "product_recommendation": "none"
  }',
  '{}',
  false,
  7,
  true
);

-- 8. High Stress/Psychological Impact - Consultation Recommended
INSERT INTO public.treatment_algorithms (
  id,
  health_vertical_id,
  name,
  conditions,
  recommendations,
  contraindications,
  requires_physician,
  priority,
  is_active
) VALUES (
  '88888888-8888-8888-8888-888888888888',
  '38a32ad9-bf29-4ba0-84e4-21313bf71bea',
  'High Psychological Impact',
  '{
    "age": {"min": 18},
    "gender": ["Male"],
    "importance": ["9", "10"],
    "hairLossOnset": {
      "contains": "Less than 6 months ago"
    },
    "hairLossProgression": ["Quickly"]
  }',
  '{
    "consultation_required": true,
    "message": "Rapid hair loss can sometimes indicate underlying conditions. Given the psychological impact and rapid progression, we recommend a comprehensive evaluation before starting treatment.",
    "referral_type": "dermatologist",
    "urgent": true
  }',
  '{}',
  true,
  8,
  true
);