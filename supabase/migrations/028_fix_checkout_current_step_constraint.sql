-- Add 'complete' to the current_step check constraint
-- Migration: 011_fix_checkout_current_step_constraint.sql

-- Drop the existing constraint
ALTER TABLE checkout_sessions DROP CONSTRAINT checkout_sessions_current_step_check;

-- Add the updated constraint that includes 'complete'
ALTER TABLE checkout_sessions ADD CONSTRAINT checkout_sessions_current_step_check 
    CHECK (current_step IN ('information', 'payment', 'processing', 'complete'));