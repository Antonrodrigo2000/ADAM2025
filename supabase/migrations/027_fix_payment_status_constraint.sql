-- ============================================================================
-- Fix Payment Status Constraint for Consultation Flow
-- Migration: 027_fix_payment_status_constraint
-- ============================================================================

-- Problem: Migration 022 introduces 'consultation_paid' status but migration 021 
-- constraint doesn't include it, causing webhook processing to fail

-- Drop the existing constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

-- Add the updated constraint with consultation_paid status
ALTER TABLE orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN (
    'pending', 
    'authorized', 
    'confirmed', 
    'failed', 
    'cancelled', 
    'voided', 
    'refunded',
    'consultation_paid'  -- Added for consultation flow
));

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON CONSTRAINT orders_payment_status_check ON orders IS 
'Payment status constraint updated to include consultation_paid for two-phase payment flow';

-- ============================================================================
-- USAGE NOTES
-- ============================================================================

/*
PAYMENT STATUS FLOW FOR CONSULTATION ORDERS:

1. Order created: payment_status = 'pending'
2. Consultation paid: payment_status = 'consultation_paid' 
3. Products approved & paid: payment_status = 'confirmed'
4. If payment fails: payment_status = 'failed'

This allows the webhook handler to properly set consultation_paid status
when the first phase of payment (consultation fee) is confirmed.
*/