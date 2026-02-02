-- Migration 004: Seed Data for Development/Testing
-- Malawi-specific test data

-- ============================================
-- SEED: Admin user
-- ============================================
INSERT INTO users (id, phone, name, email, role, verified, verification_level, preferred_language)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '+265999000001',
  'Matola Admin',
  'admin@matola.mw',
  'admin',
  TRUE,
  'full',
  'en'
) ON CONFLICT (phone) DO NOTHING;

-- ============================================
-- SEED: Sample transporters
-- ============================================
INSERT INTO users (id, phone, name, role, verified, verification_level, preferred_language, rating, total_ratings)
VALUES 
  ('t0000000-0000-0000-0000-000000000001', '+265888100001', 'Chimwemwe Banda', 'transporter', TRUE, 'rtoa', 'ny', 4.8, 127),
  ('t0000000-0000-0000-0000-000000000002', '+265999100002', 'Kondwani Phiri', 'transporter', TRUE, 'community', 'en', 4.5, 89),
  ('t0000000-0000-0000-0000-000000000003', '+265888100003', 'Mtisunge Chirwa', 'transporter', TRUE, 'id', 'ny', 4.2, 45)
ON CONFLICT (phone) DO NOTHING;

-- ============================================
-- SEED: Sample shippers
-- ============================================
INSERT INTO users (id, phone, name, role, verified, verification_level, preferred_language, rating, total_ratings)
VALUES 
  ('s0000000-0000-0000-0000-000000000001', '+265888200001', 'Mabvuto Trading Co.', 'shipper', TRUE, 'id', 'en', 4.6, 56),
  ('s0000000-0000-0000-0000-000000000002', '+265999200002', 'Tiyamike Farmers Coop', 'shipper', TRUE, 'community', 'ny', 4.3, 23),
  ('s0000000-0000-0000-0000-000000000003', '+265888200003', 'Lilongwe Cement Supplies', 'shipper', TRUE, 'full', 'en', 4.9, 112)
ON CONFLICT (phone) DO NOTHING;

-- ============================================
-- SEED: Sample vehicles
-- ============================================
INSERT INTO vehicles (id, user_id, registration, capacity_kg, type, make, status)
VALUES 
  ('v0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'BT 1234', 8000, 'medium_truck', 'FUSO Fighter', 'active'),
  ('v0000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000002', 'LL 5678', 3500, 'canter', 'Mitsubishi Canter', 'active'),
  ('v0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000003', 'MZ 9012', 1500, 'pickup', 'Toyota Hilux', 'active')
ON CONFLICT (registration) DO NOTHING;

-- ============================================
-- SEED: Sample shipments
-- ============================================
INSERT INTO shipments (
  id, shipper_id, 
  origin, origin_district, origin_region, origin_lat, origin_lng,
  destination, destination_district, destination_region, destination_lat, destination_lng,
  cargo_type, cargo_description, weight_kg, price_mwk, 
  payment_method, pickup_date, status
)
VALUES 
  (
    'sh000000-0000-0000-0000-000000000001',
    's0000000-0000-0000-0000-000000000001',
    'Lilongwe', 'Lilongwe City', 'Central', -13.9626, 33.7741,
    'Blantyre', 'Blantyre City', 'Southern', -15.7861, 35.0058,
    'general', '50 bags of maize flour', 2500, 450000,
    'airtel_money', CURRENT_DATE + INTERVAL '2 days', 'pending'
  ),
  (
    'sh000000-0000-0000-0000-000000000002',
    's0000000-0000-0000-0000-000000000002',
    'Mzuzu', 'Mzuzu City', 'Northern', -11.4657, 34.0207,
    'Lilongwe', 'Lilongwe City', 'Central', -13.9626, 33.7741,
    'tobacco', 'Tobacco bales for auction', 5000, 850000,
    'tnm_mpamba', CURRENT_DATE + INTERVAL '3 days', 'posted'
  ),
  (
    'sh000000-0000-0000-0000-000000000003',
    's0000000-0000-0000-0000-000000000003',
    'Blantyre', 'Blantyre City', 'Southern', -15.7861, 35.0058,
    'Zomba', 'Zomba City', 'Southern', -15.3833, 35.3188,
    'cement', 'Construction materials - 200 bags cement', 10000, 280000,
    'bank_transfer', CURRENT_DATE + INTERVAL '1 day', 'matched'
  );
