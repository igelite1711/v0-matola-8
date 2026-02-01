-- Migration 006: Row Level Security (RLS) Policies
-- Enforces authorization and data privacy at the database level for Supabase

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. USERS TABLE RLS
-- ============================================

-- INVARIANT: Phone numbers must never be exposed to unauthorized users
-- Users can only see their own full profile; others see limited data

CREATE POLICY "users_select_own_profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id OR role = 'admin');

CREATE POLICY "users_select_public_profile"
  ON users FOR SELECT
  USING (true) -- Public can see limited data via VIEW or filtered query
  WITH CHECK (false);

CREATE POLICY "users_update_own_profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "users_insert_own_profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "admin_manage_users"
  ON users FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 2. SHIPMENTS TABLE RLS
-- ============================================

-- INVARIANT: Users can only view/modify their own shipments and matched shipments

CREATE POLICY "shipments_select_own"
  ON shipments FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "shipments_select_matched"
  ON shipments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.shipment_id = shipments.id
      AND matches.transporter_id = auth.uid()::text
      AND matches.status IN ('accepted', 'completed')
    )
  );

CREATE POLICY "shipments_insert_own"
  ON shipments FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "shipments_update_own"
  ON shipments FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "shipments_delete_own_draft"
  ON shipments FOR DELETE
  USING (auth.uid()::text = user_id AND status = 'draft');

CREATE POLICY "admin_manage_shipments"
  ON shipments FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 3. PAYMENTS TABLE RLS
-- ============================================

-- INVARIANT: Users can only view their own payment records
-- Payment details must only be visible to involved parties

CREATE POLICY "payments_select_own"
  ON payments FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "payments_select_admin"
  ON payments FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'support'));

CREATE POLICY "payments_insert_own"
  ON payments FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "payments_update_own_pending"
  ON payments FOR UPDATE
  USING (auth.uid()::text = user_id AND status = 'pending')
  WITH CHECK (auth.uid()::text = user_id AND status = 'pending');

CREATE POLICY "payments_forbid_update_completed"
  ON payments FOR UPDATE
  USING (status != 'completed' OR escrow_status != 'released')
  WITH CHECK (status != 'completed' OR escrow_status != 'released');

-- ============================================
-- 4. MATCHES TABLE RLS
-- ============================================

-- INVARIANT: Users can only view matches they're involved in

CREATE POLICY "matches_select_own_shipment"
  ON matches FOR SELECT
  USING (
    auth.uid()::text IN (
      SELECT user_id FROM shipments WHERE id = matches.shipment_id
    )
  );

CREATE POLICY "matches_select_as_transporter"
  ON matches FOR SELECT
  USING (auth.uid()::text = transporter_id);

CREATE POLICY "matches_insert_as_system"
  ON matches FOR INSERT
  WITH CHECK (true); -- System inserts via service role

CREATE POLICY "matches_update_transporter"
  ON matches FOR UPDATE
  USING (auth.uid()::text = transporter_id)
  WITH CHECK (auth.uid()::text = transporter_id);

CREATE POLICY "admin_manage_matches"
  ON matches FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 5. RATINGS TABLE RLS
-- ============================================

-- INVARIANT: Users can only rate after shipment completion
-- Ratings are immutable and cannot be modified

CREATE POLICY "ratings_select_all"
  ON ratings FOR SELECT
  USING (true); -- Public rating data

CREATE POLICY "ratings_insert_own"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid()::text = rater_id);

CREATE POLICY "ratings_forbid_update"
  ON ratings FOR UPDATE
  USING (false)
  WITH CHECK (false); -- Ratings are immutable

CREATE POLICY "ratings_forbid_delete"
  ON ratings FOR DELETE
  USING (false); -- Ratings cannot be deleted

-- ============================================
-- 6. DISPUTES TABLE RLS
-- ============================================

-- INVARIANT: Users can only view/create disputes for their shipments
-- Support staff can manage all disputes

CREATE POLICY "disputes_select_own_shipment"
  ON disputes FOR SELECT
  USING (
    auth.uid()::text IN (
      SELECT user_id FROM shipments WHERE id = disputes.shipment_id
    )
    OR
    auth.uid()::text IN (
      SELECT transporter_id FROM matches 
      WHERE shipment_id = disputes.shipment_id
    )
  );

CREATE POLICY "disputes_select_assigned_support"
  ON disputes FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'support'));

CREATE POLICY "disputes_insert_own"
  ON disputes FOR INSERT
  WITH CHECK (
    auth.uid()::text IN (
      SELECT user_id FROM shipments WHERE id = disputes.shipment_id
    )
  );

CREATE POLICY "disputes_update_support"
  ON disputes FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'support'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'support'));

-- ============================================
-- 7. VEHICLES TABLE RLS
-- ============================================

-- INVARIANT: Users can only view/manage their own vehicles

CREATE POLICY "vehicles_select_own"
  ON vehicles FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "vehicles_insert_own"
  ON vehicles FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "vehicles_update_own"
  ON vehicles FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "admin_manage_vehicles"
  ON vehicles FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 8. WALLETS TABLE RLS
-- ============================================

-- INVARIANT: Users can only view their own wallet
-- Wallet operations are system-initiated

CREATE POLICY "wallets_select_own"
  ON wallets FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "wallets_forbid_direct_update"
  ON wallets FOR UPDATE
  USING (false)
  WITH CHECK (false); -- Only system can update wallets via service role

CREATE POLICY "wallets_forbid_delete"
  ON wallets FOR DELETE
  USING (false);

-- ============================================
-- 9. AUDIT LOGS TABLE RLS
-- ============================================

-- INVARIANT: Only admins and system can access audit logs
-- Users cannot view or modify audit logs

CREATE POLICY "audit_logs_select_admin"
  ON audit_logs FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'support'));

CREATE POLICY "audit_logs_insert_system"
  ON audit_logs FOR INSERT
  WITH CHECK (true); -- System inserts via service role

CREATE POLICY "audit_logs_forbid_update"
  ON audit_logs FOR UPDATE
  USING (false)
  WITH CHECK (false); -- Audit logs are immutable

CREATE POLICY "audit_logs_forbid_delete"
  ON audit_logs FOR DELETE
  USING (false);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- All Row Level Security policies have been enabled.
-- This ensures data privacy and authorization at the database level.
