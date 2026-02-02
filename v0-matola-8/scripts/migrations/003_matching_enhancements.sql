-- Migration 003: Matching Algorithm Enhancements
-- Adds transporter history tracking for return route detection
-- and enhanced match scoring fields

-- ============================================
-- TABLE: transporter_route_history
-- Tracks completed trips for return route detection
-- ============================================

CREATE TABLE IF NOT EXISTS transporter_route_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  origin_city VARCHAR(100) NOT NULL,
  origin_district VARCHAR(100),
  destination_city VARCHAR(100) NOT NULL,
  destination_district VARCHAR(100),
  
  completed_trips INTEGER NOT NULL DEFAULT 1,
  last_trip_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Average metrics for this route
  avg_duration_hours DECIMAL(5,1),
  avg_price_mwk DECIMAL(12,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Unique constraint on transporter + route
  CONSTRAINT unique_transporter_route UNIQUE (transporter_id, origin_city, destination_city)
);

CREATE INDEX idx_route_history_transporter ON transporter_route_history(transporter_id);
CREATE INDEX idx_route_history_origin ON transporter_route_history(origin_city);
CREATE INDEX idx_route_history_destination ON transporter_route_history(destination_city);
CREATE INDEX idx_route_history_last_trip ON transporter_route_history(last_trip_date);

-- ============================================
-- ALTER TABLE: matches - Add scoring breakdown
-- ============================================

ALTER TABLE matches ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT '{}';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_known_return_route BOOLEAN DEFAULT FALSE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS needs_admin_review BOOLEAN DEFAULT FALSE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS review_reasons TEXT[] DEFAULT '{}';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS admin_reviewed_by UUID REFERENCES users(id);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS admin_reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS notified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS notification_channels TEXT[] DEFAULT '{}';

-- Update match_status enum to include 'approved'
-- First check if it exists and add if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'approved' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'match_status')
    ) THEN
        ALTER TYPE match_status ADD VALUE 'approved' AFTER 'pending';
    END IF;
END
$$;

-- ============================================
-- TABLE: schedule_conflicts
-- Tracks transporter schedule to avoid double booking
-- ============================================

CREATE TABLE IF NOT EXISTS schedule_conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_schedule_conflict UNIQUE (transporter_id, scheduled_date)
);

CREATE INDEX idx_schedule_conflicts_transporter ON schedule_conflicts(transporter_id);
CREATE INDEX idx_schedule_conflicts_date ON schedule_conflicts(scheduled_date);

-- ============================================
-- FUNCTION: Update route history after trip completion
-- ============================================

CREATE OR REPLACE FUNCTION update_transporter_route_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run when shipment is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO transporter_route_history (
      transporter_id,
      origin_city,
      origin_district,
      destination_city,
      destination_district,
      completed_trips,
      last_trip_date,
      avg_price_mwk
    )
    SELECT 
      m.transporter_id,
      NEW.origin,
      NEW.origin_district,
      NEW.destination,
      NEW.destination_district,
      1,
      NOW(),
      NEW.price_mwk
    FROM matches m
    WHERE m.shipment_id = NEW.id
      AND m.status = 'completed'
    LIMIT 1
    ON CONFLICT (transporter_id, origin_city, destination_city)
    DO UPDATE SET
      completed_trips = transporter_route_history.completed_trips + 1,
      last_trip_date = NOW(),
      avg_price_mwk = (transporter_route_history.avg_price_mwk + EXCLUDED.avg_price_mwk) / 2,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_route_history ON shipments;
CREATE TRIGGER trigger_update_route_history
  AFTER UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_transporter_route_history();

-- ============================================
-- VIEW: Matches needing admin review
-- ============================================

CREATE OR REPLACE VIEW matches_pending_review AS
SELECT 
  m.id as match_id,
  m.match_score,
  m.score_breakdown,
  m.is_backhaul,
  m.is_known_return_route,
  m.needs_admin_review,
  m.review_reasons,
  m.matched_at,
  
  -- Shipment info
  s.id as shipment_id,
  s.origin,
  s.destination,
  s.weight_kg,
  s.price_mwk,
  s.cargo_type,
  
  -- Shipper info
  shipper.id as shipper_id,
  shipper.name as shipper_name,
  shipper.phone as shipper_phone,
  shipper.rating as shipper_rating,
  shipper.verified as shipper_verified,
  
  -- Transporter info
  trans.id as transporter_id,
  trans.name as transporter_name,
  trans.phone as transporter_phone,
  trans.rating as transporter_rating,
  trans.verified as transporter_verified,
  trans.total_ratings as transporter_total_ratings,
  
  -- Vehicle info
  v.registration as vehicle_registration,
  v.type as vehicle_type,
  v.capacity_kg as vehicle_capacity,
  
  -- Review priority
  CASE
    WHEN s.price_mwk > 500000 THEN 1
    WHEN NOT trans.verified THEN 2
    WHEN trans.total_ratings < 5 THEN 3
    ELSE 4
  END as review_priority

FROM matches m
JOIN shipments s ON m.shipment_id = s.id
JOIN users shipper ON s.shipper_id = shipper.id
JOIN users trans ON m.transporter_id = trans.id
LEFT JOIN vehicles v ON m.vehicle_id = v.id
WHERE m.status = 'pending'
  AND m.needs_admin_review = TRUE
ORDER BY review_priority, m.match_score DESC;

-- ============================================
-- VIEW: Transporter with route experience
-- Useful for matching queries
-- ============================================

CREATE OR REPLACE VIEW transporters_with_experience AS
SELECT 
  u.id,
  u.name,
  u.phone,
  u.rating,
  u.total_ratings,
  u.verified,
  u.verification_level,
  u.last_login_at as last_active_at,
  
  v.id as vehicle_id,
  v.registration as vehicle_plate,
  v.type as vehicle_type,
  v.capacity_kg as vehicle_capacity,
  v.has_refrigeration,
  v.current_location_lat,
  v.current_location_lng,
  
  COALESCE(stats.total_completed, 0) as completed_trips,
  COALESCE(stats.on_time_rate, 0.8) as on_time_rate
  
FROM users u
JOIN vehicles v ON u.id = v.user_id AND v.status = 'active'
LEFT JOIN (
  SELECT 
    m.transporter_id,
    COUNT(*) as total_completed,
    AVG(CASE WHEN s.status = 'completed' THEN 1.0 ELSE 0.0 END) as on_time_rate
  FROM matches m
  JOIN shipments s ON m.shipment_id = s.id
  WHERE m.status = 'completed'
  GROUP BY m.transporter_id
) stats ON u.id = stats.transporter_id
WHERE u.role = 'transporter'
  AND u.is_active = TRUE;

-- ============================================
-- INDEXES for matching queries
-- ============================================

CREATE INDEX IF NOT EXISTS idx_matches_needs_review 
  ON matches(needs_admin_review) 
  WHERE needs_admin_review = TRUE;

CREATE INDEX IF NOT EXISTS idx_matches_status_pending 
  ON matches(status) 
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_shipments_status_pending 
  ON shipments(status) 
  WHERE status = 'pending';
