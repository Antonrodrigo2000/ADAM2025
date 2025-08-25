-- Migration to update hair loss questionnaire with new question properties
-- and separate photo questions

-- First, delete existing questions and questionnaire
DELETE FROM public.questions 
WHERE questionnaire_id = (
  SELECT id FROM public.questionnaires 
  WHERE health_vertical_id = (SELECT id FROM public.health_verticals WHERE slug = 'hair-loss')
);

DELETE FROM public.questionnaires 
WHERE health_vertical_id = (SELECT id FROM public.health_verticals WHERE slug = 'hair-loss');

-- Insert updated questionnaire
INSERT INTO public.questionnaires (id, health_vertical_id, version, name, description, is_active)
VALUES (
  '724410b6-680f-4ef1-a92e-03ed963a088c',
  (SELECT id FROM public.health_verticals WHERE slug = 'hair-loss'),
  2,
  'Hair Loss Assessment Questionnaire',
  'A comprehensive questionnaire to assess hair loss patterns, history, and treatment preferences.',
  true
);

-- Insert questions with updated question_property values
INSERT INTO public.questions (questionnaire_id, question_property, question_text, question_type, options, order_index, is_required)
VALUES 
-- Age question (unchanged)
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'age',
  'What is your age?',
  'number',
  NULL,
  1,
  true
),
-- Gender question (unchanged)
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'gender',
  'What is your gender?',
  'select',
  '["Male", "Female"]'::jsonb,
  2,
  true
),
-- Hair loss areas (unchanged)
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'hairLossAreas',
  'Where are you losing hair? (Select all that apply)',
  'checkbox',
  '["Temples (sides of forehead)", "Crown (top back of head)", "Overall thinning (hair getting thinner everywhere)", "Patches of complete hair loss (bald spots)"]'::jsonb,
  3,
  true
),
-- Hair loss onset (unchanged)
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'hairLossOnset',
  'When did you first notice your hair loss?',
  'select',
  '["Less than 6 months ago", "6 months to 1 year ago", "1 to 5 years ago", "More than 5 years ago"]'::jsonb,
  4,
  true
),
-- Hair loss progression (unchanged)
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'hairLossProgression',
  'How quickly has your hair loss progressed?',
  'select',
  '["Slowly", "Moderately", "Quickly"]'::jsonb,
  5,
  true
),
-- UPDATED: familyHistory -> familyHistoryHairLoss
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'familyHistoryHairLoss',
  'Do any of your male relatives have similar hair loss?',
  'radio',
  '["Yes", "No"]'::jsonb,
  6,
  true
),
-- UPDATED: familyHistoryAge -> familyHistoryHairLossAge
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'familyHistoryHairLossAge',
  'If yes, at what age did they start losing hair?',
  'text',
  NULL,
  7,
  true
),
-- Medical conditions (unchanged)
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'medicalConditions',
  'Do you have any of the following conditions? (Select all that apply)',
  'checkbox',
  '["Allergy to finasteride", "Allergy to minoxidil", "Heart conditions", "Liver disease", "Prostate cancer history", "Low blood pressure", "Scalp wounds or infections", "Scalp sensitivity", "Pregnant woman in household", "Other medical conditions", "None of the above"]'::jsonb,
  8,
  true
),
-- Other medical conditions (unchanged)
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'otherMedicalConditions',
  'If you selected "Other medical conditions," please specify.',
  'text',
  NULL,
  9,
  true
),
-- UPDATED: medications -> currentMedications
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'currentMedications',
  'Are you currently taking any medications?',
  'radio',
  '["Yes", "No"]'::jsonb,
  10,
  true
),
-- UPDATED: medicationsList -> currentMedicationList
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'currentMedicationList',
  'If yes, please list them.',
  'text',
  NULL,
  11,
  true
),
-- UPDATED: previousTreatments -> previousHairLossTreatments
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'previousHairLossTreatments',
  'Have you tried any hair loss treatments before?',
  'radio',
  '["Yes", "No"]'::jsonb,
  12,
  true
),
-- UPDATED: previousTreatmentsDetails -> previousHairLossTreatmentsDetails
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'previousHairLossTreatmentsDetails',
  'If yes, please describe what you tried and the results.',
  'text',
  NULL,
  13,
  true
),
-- Treatment goals (unchanged)
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'treatmentGoals',
  'What are your main goals for hair loss treatment? (Select all that apply)',
  'checkbox',
  '["Stop hair loss", "Regrow hair", "Improve appearance", "Other"]'::jsonb,
  14,
  true
),
-- UPDATED: importance -> importanceScaleRating
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'importanceScaleRating',
  'How important is treating your hair loss to you? (1 = Not important, 10 = Very important)',
  'scale',
  '["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]'::jsonb,
  15,
  true
),
-- UPDATED: commitment -> sixMonthCommitment
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'sixMonthCommitment',
  'Are you willing to follow a daily treatment routine for at least 6 months?',
  'radio',
  '["Yes", "No"]'::jsonb,
  16,
  true
),
-- NEW: Separate front scalp photo
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'scalpPhotoFront',
  'Please upload a front view photo of your scalp. For best results, take the photo in good lighting with your hair dry and styled as usual.',
  'file',
  NULL,
  17,
  true
),
-- NEW: Separate back scalp photo
(
  (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire'),
  'scalpPhotoBack',
  'Please upload a back view photo of your scalp. For best results, take the photo in good lighting with your hair dry and styled as usual.',
  'file',
  NULL,
  18,
  true
);

-- Update questions with conditional logic
UPDATE public.questions
SET conditional_logic = jsonb_build_object(
  'questionId', (SELECT id FROM public.questions WHERE questionnaire_id = questions.questionnaire_id AND order_index = 6),
  'value', 'Yes'
)
WHERE order_index = 7 AND questionnaire_id = (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire');

UPDATE public.questions
SET conditional_logic = jsonb_build_object(
  'questionId', (SELECT id FROM public.questions WHERE questionnaire_id = questions.questionnaire_id AND order_index = 8),
  'value', 'Other medical conditions'
)
WHERE order_index = 9 AND questionnaire_id = (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire');

UPDATE public.questions
SET conditional_logic = jsonb_build_object(
  'questionId', (SELECT id FROM public.questions WHERE questionnaire_id = questions.questionnaire_id AND order_index = 10),
  'value', 'Yes'
)
WHERE order_index = 11 AND questionnaire_id = (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire');

UPDATE public.questions
SET conditional_logic = jsonb_build_object(
  'questionId', (SELECT id FROM public.questions WHERE questionnaire_id = questions.questionnaire_id AND order_index = 12),
  'value', 'Yes'
)
WHERE order_index = 13 AND questionnaire_id = (SELECT id FROM public.questionnaires WHERE name = 'Hair Loss Assessment Questionnaire');