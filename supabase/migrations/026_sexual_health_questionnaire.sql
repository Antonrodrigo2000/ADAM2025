-- Migration to add sexual health questionnaire
-- Sexual health vertical and comprehensive questionnaire for sexual health assessment

-- Insert into health_verticals table
INSERT INTO public.health_verticals (name, slug, description, is_active, requires_age_verification, min_age, max_age)
VALUES (
  'Sexual Health',
  'sexual-health',
  'Assessment for sexual health conditions and treatment options.',
  true,
  true,
  18,
  70
);

-- Insert into questionnaires table, linking to the 'Sexual Health' health vertical
INSERT INTO public.questionnaires (id, health_vertical_id, version, name, description, is_active)
VALUES (
  '924510c6-780f-5ef2-b93e-04fd964a188d',
  (SELECT id FROM public.health_verticals WHERE slug = 'sexual-health'),
  1,
  'Sexual Health Assessment Questionnaire',
  'A comprehensive questionnaire to assess sexual health concerns and treatment needs.',
  true
);

-- Insert questions into the questions table
INSERT INTO public.questions (questionnaire_id, question_property, question_text, question_type, options, order_index, is_required)
VALUES 
-- Age Range
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'ageRange',
  'How old are you?',
  'select',
  '["18-25 years", "26-35 years", "36-45 years", "46-55 years", "Over 55 years"]'::jsonb,
  1,
  true
),
-- Primary Sexual Health Concern
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'primarySexualHealthConcern',
  'What sexual health problem are you having?',
  'select',
  '["Problems getting or keeping an erection (hard penis)", "Coming too quickly during sex", "Both problems above", "Other sexual problems"]'::jsonb,
  2,
  true
),
-- Erection Achievement Frequency
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'erectionAchievementFrequency',
  'How often do you have trouble getting an erection hard enough for sex?',
  'select',
  '["Almost never", "Sometimes (about half the time)", "Most of the time", "Almost always"]'::jsonb,
  3,
  true
),
-- Erection Maintenance Frequency
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'erectionMaintenanceFrequency',
  'When you do get an erection, how often can you keep it during sex?',
  'select',
  '["Almost always", "Most of the time", "Sometimes", "Almost never"]'::jsonb,
  4,
  true
),
-- Morning Erections Frequency
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'morningErectionsFrequency',
  'Do you get morning erections (wake up with hard penis)?',
  'select',
  '["Yes, often", "Yes, sometimes", "Rarely", "Never"]'::jsonb,
  5,
  true
),
-- Intercourse Duration Before Ejaculation
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'intercoursesDurationBeforeEjaculation',
  'How long do you usually last during sex before you come?',
  'select',
  '["Less than 1 minute", "1-2 minutes", "2-5 minutes", "More than 5 minutes"]'::jsonb,
  6,
  true
),
-- Ejaculation Control Level
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'ejaculationControlLevel',
  'How much control do you feel you have over when you come?',
  'select',
  '["Very good control", "Some control", "Little control", "No control"]'::jsonb,
  7,
  true
),
-- Premature Ejaculation Distress Level
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'prematureEjaculationDistressLevel',
  'How much does this problem bother you?',
  'select',
  '["Not bothered", "A little bothered", "Quite bothered", "Very bothered"]'::jsonb,
  8,
  true
),
-- Takes Heart Medications
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'takesHeartMedications',
  'Do you take any heart medicines?',
  'radio',
  '["Yes", "No", "Not sure"]'::jsonb,
  9,
  true
),
-- Takes Chest Pain Medications
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'takesChestPainMedications',
  'Do you take any medicines for chest pain?',
  'radio',
  '["Yes", "No", "Not sure"]'::jsonb,
  10,
  true
),
-- Chest Pain During/After Sex
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'chestPainDuringSexOrAfterSex',
  'Have you had chest pain during or after sex?',
  'radio',
  '["Yes, recently (last 6 months)", "Yes, but not recently", "No, never"]'::jsonb,
  11,
  true
),
-- Existing Medical Conditions List
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'existingMedicalConditionsList',
  'Do you have any of these health problems?',
  'checkbox',
  '["Heart disease", "High blood pressure", "Diabetes", "Depression", "None of these", "Not sure"]'::jsonb,
  12,
  true
),
-- Currently Taking Regular Medications
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'currentlyTakingRegularMedications',
  'Are you currently taking any regular medicines?',
  'radio',
  '["No medicines", "Yes (we will ask about these in your consultation)"]'::jsonb,
  13,
  true
),
-- Regular Medications Details
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'regularMedicationsDetails',
  'Are you currently taking any regular medications? (details if yes)',
  'text',
  NULL,
  14,
  false
),
-- Previous Erection Treatments Experience
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'previousErectionTreatmentsExperience',
  'Have you tried medicines for erection problems before?',
  'radio',
  '["No, never tried", "Yes, they worked well", "Yes, they didn not work", "Yes, I had bad side effects"]'::jsonb,
  15,
  true
),
-- Smoking Status
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'smokingStatus',
  'Do you smoke cigarettes?',
  'radio',
  '["No, never smoked", "No, quit smoking", "Yes, I smoke"]'::jsonb,
  16,
  true
),
-- Weekly Alcohol Consumption Range
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'weeklyAlcoholConsumptionRange',
  'How many alcoholic drinks do you have per week?',
  'select',
  '["None", "1-7 drinks", "8-14 drinks", "More than 14 drinks"]'::jsonb,
  17,
  true
),
-- Current Stress Level
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'currentStressLevel',
  'How would you describe your stress level?',
  'select',
  '["Low stress", "Some stress", "High stress", "Very high stress"]'::jsonb,
  18,
  true
),
-- Importance Of Resolving Sexual Issues
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'importanceOfResolvingSexualIssues',
  'How important is it to fix this sexual problem?',
  'select',
  '["Very important", "Quite important", "Somewhat important", "Not very important"]'::jsonb,
  19,
  true
),
-- Current Relationship Status
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'currentRelationshipStatus',
  'Are you in a relationship?',
  'radio',
  '["Yes, same partner", "Yes, multiple partners", "No, single", "Prefer not to say"]'::jsonb,
  20,
  true
),
-- Expected Treatment Outcomes List
(
  (SELECT id FROM public.questionnaires WHERE name = 'Sexual Health Assessment Questionnaire'),
  'expectedTreatmentOutcomesList',
  'What do you hope treatment will do for you?',
  'checkbox',
  '["Get better erections", "Last longer during sex", "Feel more confident", "Improve my relationship", "All of the above"]'::jsonb,
  21,
  true
);

-- Update questions with conditional logic
-- First, get the questionnaire ID as a variable to avoid subquery issues
DO $$
DECLARE
    questionnaire_uuid UUID;
    primary_concern_question_id UUID;
    medication_question_id UUID;
BEGIN
    -- Get questionnaire ID
    SELECT id INTO questionnaire_uuid 
    FROM public.questionnaires 
    WHERE name = 'Sexual Health Assessment Questionnaire';
    
    -- Get primary concern question ID (order_index = 2)
    SELECT id INTO primary_concern_question_id 
    FROM public.questions 
    WHERE questionnaire_id = questionnaire_uuid AND order_index = 2;
    
    -- Get medication question ID (order_index = 13)
    SELECT id INTO medication_question_id 
    FROM public.questions 
    WHERE questionnaire_id = questionnaire_uuid AND order_index = 13;
    
    -- Show ED questions (3,4,5) if primary concern is ED or Both
    UPDATE public.questions
    SET conditional_logic = jsonb_build_object(
        'questionId', primary_concern_question_id,
        'value', 'Problems getting or keeping an erection (hard penis)'
    )
    WHERE order_index = 3 AND questionnaire_id = questionnaire_uuid;
    
    UPDATE public.questions
    SET conditional_logic = jsonb_build_object(
        'questionId', primary_concern_question_id,
        'value', 'Problems getting or keeping an erection (hard penis)'
    )
    WHERE order_index = 4 AND questionnaire_id = questionnaire_uuid;
    
    UPDATE public.questions
    SET conditional_logic = jsonb_build_object(
        'questionId', primary_concern_question_id,
        'value', 'Problems getting or keeping an erection (hard penis)'
    )
    WHERE order_index = 5 AND questionnaire_id = questionnaire_uuid;
    
    -- Show PE questions (6,7,8) if primary concern is PE or Both
    UPDATE public.questions
    SET conditional_logic = jsonb_build_object(
        'questionId', primary_concern_question_id,
        'value', 'Coming too quickly during sex'
    )
    WHERE order_index = 6 AND questionnaire_id = questionnaire_uuid;
    
    UPDATE public.questions
    SET conditional_logic = jsonb_build_object(
        'questionId', primary_concern_question_id,
        'value', 'Coming too quickly during sex'
    )
    WHERE order_index = 7 AND questionnaire_id = questionnaire_uuid;
    
    UPDATE public.questions
    SET conditional_logic = jsonb_build_object(
        'questionId', primary_concern_question_id,
        'value', 'Coming too quickly during sex'
    )
    WHERE order_index = 8 AND questionnaire_id = questionnaire_uuid;
    
    -- Show medication details (14) if takes regular medications is "Yes" 
    UPDATE public.questions
    SET conditional_logic = jsonb_build_object(
        'questionId', medication_question_id,
        'value', 'Yes (we will ask about these in your consultation)'
    )
    WHERE order_index = 14 AND questionnaire_id = questionnaire_uuid;
END $$;