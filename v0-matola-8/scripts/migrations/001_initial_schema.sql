-- Migration 001: Initial Schema
-- Matola Platform - PostgreSQL Database Schema
-- Aligned with Production Requirements Document

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================
-- ENUM TYPES
-- ============================================

-- User roles (extended from PRD to match existing app)
CREATE TYPE user_role AS ENUM ('transporter', 'shipper', 'broker', 'admin');

-- Vehicle types (Malawi-specific)
CREATE TYPE vehicle_type AS ENUM (
  'motorcycle', 
  'pickup', 
  'van', 
  'canter',      -- Common Malawi term for small trucks
  'small_truck', 
  'medium_truck', 
  'large_truck', 
  'flatbed', 
  'refrigerated', 
  'tanker'
);

-- Vehicle status
CREATE TYPE vehicle_status AS ENUM ('active', 'inactive', 'maintenance');

-- Shipment status (extended for checkpoint/border tracking)
CREATE TYPE shipment_status AS ENUM (
  'draft',
  'pending',
  'posted',
  'matched',
  'confirmed',
  'picked_up',
  'in_transit',
  'at_checkpoint',
  'at_border',
  'delivered',
  'completed',
  'cancelled',
  'disputed'
);

-- Cargo types (Malawi agricultural focus)
CREATE TYPE cargo_type AS ENUM (
  'general',
  'agricultural',
  'maize',
  'tobacco',
  'tea',
  'sugar',
  'fertilizer',
  'construction',
  'cement',
  'fuel',
  'fragile',
  'perishable',
  'hazardous',
  'livestock'
);

-- Payment methods (Malawi mobile money)
CREATE TYPE payment_method AS ENUM ('airtel_money', 'tnm_mpamba', 'cash', 'bank_transfer');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'escrow');

-- Match status
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'rejected', 'expired', 'completed');

-- Verification levels
CREATE TYPE verification_level AS ENUM ('none', 'phone', 'id', 'community', 'rtoa', 'full');

-- Language preference
CREATE TYPE language_preference AS ENUM ('en', 'ny'); -- English, Chichewa

-- Malawi regions
CREATE TYPE malawi_region AS ENUM ('Northern', 'Central', 'Southern');

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role user_role NOT NULL DEFAULT 'shipper',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_level verification_level NOT NULL DEFAULT 'none',
  pin_hash VARCHAR(255), -- Hashed PIN for USSD authentication
  whatsapp VARCHAR(15),
  avatar_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  preferred_language language_preference NOT NULL DEFAULT 'en',
  community_vouchers UUID[] DEFAULT '{}', -- Array of user IDs who vouched
  chief_reference JSONB, -- { name, village, district }
  rtoa_membership VARCHAR(50), -- RTOA membership number
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT users_phone_unique UNIQUE (phone),
  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_rating_range CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT users_phone_format CHECK (phone ~ '^\+?[0-9]{9,15}$')
);

-- User indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verified ON users(verified);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================
-- TABLE: vehicles
-- ============================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registration VARCHAR(20) NOT NULL,
  capacity_kg INTEGER NOT NULL,
  type vehicle_type NOT NULL,
  make VARCHAR(100), -- e.g., "Mitsubishi Canter"
  model VARCHAR(100),
  year INTEGER,
  status vehicle_status NOT NULL DEFAULT 'active',
  has_refrigeration BOOLEAN DEFAULT FALSE,
  has_gps BOOLEAN DEFAULT FALSE,
  insurance_expiry DATE,
  fitness_expiry DATE,
  current_location_lat DECIMAL(10,8),
  current_location_lng DECIMAL(11,8),
  current_location_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT vehicles_registration_unique UNIQUE (registration),
  CONSTRAINT vehicles_capacity_positive CHECK (capacity_kg > 0),
  CONSTRAINT vehicles_year_valid CHECK (year IS NULL OR (year >= 1990 AND year <= EXTRACT(YEAR FROM NOW()) + 1))
);

-- Vehicle indexes
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_vehicles_type ON vehicles(type);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_registration ON vehicles(registration);

-- ============================================
-- TABLE: shipments
-- ============================================
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipper_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  
  -- Origin details
  origin VARCHAR(255) NOT NULL,
  origin_district VARCHAR(100),
  origin_region malawi_region,
  origin_lat DECIMAL(10,8),
  origin_lng DECIMAL(11,8),
  origin_landmark VARCHAR(255), -- Critical for Malawi navigation
  
  -- Destination details
  destination VARCHAR(255) NOT NULL,
  destination_district VARCHAR(100),
  destination_region malawi_region,
  destination_lat DECIMAL(10,8),
  destination_lng DECIMAL(11,8),
  destination_landmark VARCHAR(255),
  
  -- Cargo details
  cargo_type cargo_type NOT NULL DEFAULT 'general',
  cargo_description VARCHAR(500),
  cargo_description_ny VARCHAR(500), -- Chichewa description
  weight_kg DECIMAL(10,2) NOT NULL,
  dimensions JSONB, -- { length, width, height }
  required_vehicle_type vehicle_type,
  
  -- Pricing
  price_mwk DECIMAL(12,2) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'airtel_money',
  is_backhaul BOOLEAN DEFAULT FALSE,
  backhaul_discount_percent DECIMAL(5,2),
  
  -- Scheduling
  pickup_date DATE NOT NULL,
  pickup_time_window VARCHAR(50),
  delivery_date DATE,
  
  -- Status
  status shipment_status NOT NULL DEFAULT 'pending',
  special_instructions TEXT,
  
  -- Border crossing
  border_crossing_required BOOLEAN DEFAULT FALSE,
  border_post VARCHAR(100),
  estimated_clearance_hours INTEGER,
  
  -- Seasonal categorization
  seasonal_category VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT shipments_price_positive CHECK (price_mwk > 0),
  CONSTRAINT shipments_weight_positive CHECK (weight_kg > 0),
  CONSTRAINT shipments_backhaul_discount_range CHECK (
    backhaul_discount_percent IS NULL OR 
    (backhaul_discount_percent >= 0 AND backhaul_discount_percent <= 100)
  ),
  CONSTRAINT shipments_dates_valid CHECK (delivery_date IS NULL OR delivery_date >= pickup_date)
);

-- Shipment indexes
CREATE INDEX idx_shipments_shipper_id ON shipments(shipper_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_pickup_date ON shipments(pickup_date);
CREATE INDEX idx_shipments_status_pickup_date ON shipments(status, pickup_date);
CREATE INDEX idx_shipments_origin_region ON shipments(origin_region);
CREATE INDEX idx_shipments_destination_region ON shipments(destination_region);
CREATE INDEX idx_shipments_cargo_type ON shipments(cargo_type);
CREATE INDEX idx_shipments_created_at ON shipments(created_at);

-- ============================================
-- TABLE: matches
-- ============================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  transporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  
  status match_status NOT NULL DEFAULT 'pending',
  match_score DECIMAL(5,2) NOT NULL,
  is_backhaul BOOLEAN DEFAULT FALSE,
  proposed_price_mwk DECIMAL(12,2),
  
  -- Timestamps
  matched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT matches_score_range CHECK (match_score >= 0 AND match_score <= 100),
  CONSTRAINT matches_proposed_price_positive CHECK (proposed_price_mwk IS NULL OR proposed_price_mwk > 0)
);

-- Match indexes
CREATE INDEX idx_matches_shipment_id ON matches(shipment_id);
CREATE INDEX idx_matches_transporter_id ON matches(transporter_id);
CREATE INDEX idx_matches_vehicle_id ON matches(vehicle_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_shipment_transporter ON matches(shipment_id, transporter_id);
CREATE INDEX idx_matches_matched_at ON matches(matched_at);

-- ============================================
-- TABLE: payments
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE RESTRICT,
  payer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  payee_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  
  amount_mwk DECIMAL(12,2) NOT NULL,
  platform_fee_mwk DECIMAL(12,2) DEFAULT 0,
  net_amount_mwk DECIMAL(12,2),
  
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  
  reference VARCHAR(100) NOT NULL,
  provider_reference VARCHAR(100),
  provider_response JSONB,
  
  -- Escrow details
  is_escrow BOOLEAN DEFAULT FALSE,
  escrow_released_at TIMESTAMP WITH TIME ZONE,
  escrow_release_reason VARCHAR(255),
  
  -- Timestamps
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT payments_reference_unique UNIQUE (reference),
  CONSTRAINT payments_amount_positive CHECK (amount_mwk > 0),
  CONSTRAINT payments_platform_fee_valid CHECK (platform_fee_mwk >= 0),
  CONSTRAINT payments_net_amount_valid CHECK (net_amount_mwk IS NULL OR net_amount_mwk >= 0)
);

-- Payment indexes
CREATE INDEX idx_payments_shipment_id ON payments(shipment_id);
CREATE INDEX idx_payments_payer_id ON payments(payer_id);
CREATE INDEX idx_payments_payee_id ON payments(payee_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_reference ON payments(reference);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- ============================================
-- TABLE: ussd_sessions
-- ============================================
CREATE TABLE ussd_sessions (
  session_id VARCHAR(100) PRIMARY KEY,
  phone VARCHAR(15) NOT NULL,
  state VARCHAR(50) NOT NULL DEFAULT 'welcome',
  context JSONB NOT NULL DEFAULT '{}',
  language language_preference NOT NULL DEFAULT 'en',
  
  -- Session tracking
  messages_count INTEGER DEFAULT 0,
  last_input VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT ussd_sessions_phone_format CHECK (phone ~ '^\+?[0-9]{9,15}$')
);

-- USSD session indexes
CREATE INDEX idx_ussd_sessions_phone ON ussd_sessions(phone);
CREATE INDEX idx_ussd_sessions_updated_at ON ussd_sessions(updated_at);
CREATE INDEX idx_ussd_sessions_state ON ussd_sessions(state);

-- ============================================
-- TABLE: audit_logs
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id UUID,
  
  changes JSONB,
  old_values JSONB,
  new_values JSONB,
  
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(100),
  
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Audit log indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp);

-- ============================================
-- TABLE: checkpoints (Extended for Malawi logistics)
-- ============================================
CREATE TABLE checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  location_city VARCHAR(100),
  location_district VARCHAR(100),
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  
  checkpoint_type VARCHAR(50) DEFAULT 'transit', -- 'pickup', 'dropoff', 'transit', 'border'
  
  arrived_at TIMESTAMP WITH TIME ZONE,
  departed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  confirmed_by VARCHAR(50), -- 'driver', 'shipper', 'automatic', 'geofence'
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checkpoints_shipment_id ON checkpoints(shipment_id);

-- ============================================
-- TABLE: disputes
-- ============================================
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE RESTRICT,
  
  reported_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reported_by_role user_role NOT NULL,
  against_user UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  against_user_role user_role NOT NULL,
  
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  voice_note_url TEXT,
  images TEXT[],
  
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  resolution TEXT,
  resolved_by UUID REFERENCES users(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT disputes_status_check CHECK (
    status IN ('open', 'investigating', 'resolved', 'escalated', 'closed')
  )
);

CREATE INDEX idx_disputes_shipment_id ON disputes(shipment_id);
CREATE INDEX idx_disputes_reported_by ON disputes(reported_by);
CREATE INDEX idx_disputes_status ON disputes(status);

-- ============================================
-- TABLE: ratings
-- ============================================
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_role user_role NOT NULL,
  to_role user_role NOT NULL,
  
  overall_rating DECIMAL(2,1) NOT NULL,
  category_ratings JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  review TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT ratings_overall_range CHECK (overall_rating >= 1 AND overall_rating <= 5),
  CONSTRAINT ratings_unique_per_shipment UNIQUE (shipment_id, from_user_id, to_user_id)
);

CREATE INDEX idx_ratings_to_user_id ON ratings(to_user_id);
CREATE INDEX idx_ratings_shipment_id ON ratings(shipment_id);

-- ============================================
-- TABLE: wallets
-- ============================================
CREATE TABLE wallets (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  available_balance_mwk DECIMAL(15,2) NOT NULL DEFAULT 0,
  pending_balance_mwk DECIMAL(15,2) NOT NULL DEFAULT 0,
  escrow_balance_mwk DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_earned_mwk DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_withdrawn_mwk DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT wallets_balances_non_negative CHECK (
    available_balance_mwk >= 0 AND
    pending_balance_mwk >= 0 AND
    escrow_balance_mwk >= 0
  )
);

-- ============================================
-- TABLE: wallet_transactions
-- ============================================
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  
  type VARCHAR(30) NOT NULL,
  amount_mwk DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  
  shipment_id UUID REFERENCES shipments(id),
  method payment_method,
  reference VARCHAR(100),
  description TEXT,
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT wallet_transactions_type_check CHECK (
    type IN ('payment', 'payout', 'refund', 'escrow_hold', 'escrow_release', 'commission', 'tip')
  ),
  CONSTRAINT wallet_transactions_status_check CHECK (
    status IN ('pending', 'completed', 'failed', 'held', 'released')
  )
);

CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_shipment_id ON wallet_transactions(shipment_id);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);

-- ============================================
-- TABLE: escrow_holds
-- ============================================
CREATE TABLE escrow_holds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE RESTRICT,
  
  shipper_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  transporter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  
  gross_amount_mwk DECIMAL(12,2) NOT NULL,
  platform_fee_mwk DECIMAL(12,2) NOT NULL,
  net_amount_mwk DECIMAL(12,2) NOT NULL,
  
  status VARCHAR(20) NOT NULL DEFAULT 'held',
  release_condition VARCHAR(50) NOT NULL DEFAULT 'delivery_confirmed',
  
  held_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  released_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT escrow_holds_status_check CHECK (
    status IN ('held', 'released', 'refunded', 'disputed')
  ),
  CONSTRAINT escrow_holds_amounts_positive CHECK (
    gross_amount_mwk > 0 AND net_amount_mwk >= 0
  )
);

CREATE INDEX idx_escrow_holds_shipment_id ON escrow_holds(shipment_id);
CREATE INDEX idx_escrow_holds_status ON escrow_holds(status);

-- ============================================
-- TABLE: payment_methods (user saved payment methods)
-- ============================================
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type payment_method NOT NULL,
  phone_number VARCHAR(15),
  account_number VARCHAR(50),
  bank_name VARCHAR(100),
  
  is_primary BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
