-- Fix checkout_session_events RLS - missing INSERT policy for triggers

-- Add INSERT policy for checkout_session_events
-- This allows users to insert events for sessions they own
CREATE POLICY "Users can insert events for their checkout sessions" ON checkout_session_events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM checkout_sessions cs
            WHERE cs.id = checkout_session_events.session_id
            AND (cs.user_id = auth.uid() OR cs.user_id IS NULL)
        )
    );

-- Also need to allow system triggers to work with service role
-- Add a policy that allows inserting events for any session when using service role
CREATE POLICY "Service role can insert checkout session events" ON checkout_session_events
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role'
    );

-- Grant necessary permissions to authenticated users
GRANT INSERT ON checkout_session_events TO authenticated;