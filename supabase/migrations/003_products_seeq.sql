-- Insert into products table
INSERT INTO public.products (
  health_vertical_id,
  name,
  description,
  active_ingredient,
  dosage,
  price,
  consultation_fee,
  prescription_required,
  stock_quantity,
  is_active,
  images,
  metadata
)
VALUES (
  (SELECT id FROM public.health_verticals WHERE slug = 'hair-loss'),
  'Adam Combination Spray',
  'A topical solution combining minoxidil and finasteride to promote hair regrowth and prevent further hair loss in individuals with androgenetic alopecia.',
  'Minoxidil 5%, Finasteride 0.25%',
  'Apply 1 mL (5-7 sprays) to affected scalp areas twice daily',
  50.00,
  25.00,
  true,
  100,
  true,
  NULL,
  '{"form": "Topical Spray", "volume": "60 mL", "treatment_duration": "3-6 months"}'::jsonb
);

INSERT INTO public.products (
  health_vertical_id,
  name,
  description,
  active_ingredient,
  dosage,
  price,
  consultation_fee,
  prescription_required,
  stock_quantity,
  is_active,
  images,
  metadata
)
VALUES (
  (SELECT id FROM public.health_verticals WHERE slug = 'hair-loss'),
  'Adam Minoxidil Topical 5%',
  'A 5% minoxidil topical solution designed to stimulate hair regrowth in individuals experiencing early-stage hair loss.',
  'Minoxidil 5%',
  'Apply 1 mL to affected scalp areas twice daily',
  30.00,
  25.00,
  false,
  150,
  true,
  NULL,
  '{"form": "Topical Solution", "volume": "60 mL", "treatment_duration": "3-6 months"}'::jsonb
);
