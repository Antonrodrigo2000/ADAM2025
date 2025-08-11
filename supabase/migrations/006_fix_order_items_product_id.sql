-- ============================================================================
-- Fix order_items table to use Genie product IDs directly
-- Change product_id from UUID to VARCHAR to store Genie product IDs
-- Also fix missing RLS INSERT policy
-- ============================================================================

-- Drop the foreign key constraint first
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Change product_id from UUID to VARCHAR to store Genie product IDs directly
ALTER TABLE order_items ALTER COLUMN product_id TYPE VARCHAR(255);

-- Add missing INSERT policy for order_items (users can create items for their own orders)
CREATE POLICY "Users can create order items for their own orders" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Add comment to explain the design decision
COMMENT ON COLUMN order_items.product_id IS 'Genie product ID stored as string (e.g. "6888fa5ae4b41311603613c9")';