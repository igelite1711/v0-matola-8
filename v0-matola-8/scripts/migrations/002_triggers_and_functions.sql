-- Migration 002: Triggers and Functions
-- Auto-update timestamps, data retention, and utility functions

-- ============================================
-- FUNCTION: Update timestamp trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ussd_sessions_updated_at
  BEFORE UPDATE ON ussd_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Auto-create wallet for new users
-- ============================================
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_wallet_after_user_insert
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();

-- ============================================
-- FUNCTION: Update user rating after new rating
-- ============================================
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
DECLARE
  new_avg DECIMAL(3,2);
  new_count INTEGER;
BEGIN
  SELECT 
    COALESCE(AVG(overall_rating), 0),
    COUNT(*)
  INTO new_avg, new_count
  FROM ratings
  WHERE to_user_id = NEW.to_user_id;
  
  UPDATE users
  SET 
    rating = new_avg,
    total_ratings = new_count
  WHERE id = NEW.to_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_after_insert
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- ============================================
-- FUNCTION: Audit log trigger
-- ============================================
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  audit_action VARCHAR(50);
  changes_json JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    audit_action := 'create';
    changes_json := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    audit_action := 'update';
    changes_json := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    audit_action := 'delete';
    changes_json := to_jsonb(OLD);
  END IF;
  
  INSERT INTO audit_logs (
    user_id,
    action,
    entity,
    entity_id,
    changes
  ) VALUES (
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    audit_action,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    changes_json
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_shipments
  AFTER INSERT OR UPDATE OR DELETE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_matches
  AFTER INSERT OR UPDATE OR DELETE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- ============================================
-- FUNCTION: Clean old USSD sessions (7 days)
-- ============================================
CREATE OR REPLACE FUNCTION clean_old_ussd_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ussd_sessions
  WHERE updated_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Clean old audit logs (30 days for non-critical)
-- ============================================
CREATE OR REPLACE FUNCTION clean_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Keep payment and security-related logs longer
  DELETE FROM audit_logs
  WHERE timestamp < NOW() - INTERVAL '30 days'
    AND entity NOT IN ('payments', 'users', 'escrow_holds');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Calculate shipment price estimate
-- ============================================
CREATE OR REPLACE FUNCTION calculate_price_estimate(
  p_distance_km DECIMAL,
  p_weight_kg DECIMAL,
  p_cargo_type cargo_type,
  p_is_backhaul BOOLEAN DEFAULT FALSE
)
RETURNS DECIMAL AS $$
DECLARE
  base_rate DECIMAL := 150; -- MWK per km
  weight_factor DECIMAL;
  cargo_multiplier DECIMAL := 1.0;
  backhaul_discount DECIMAL := 0.15;
  total_price DECIMAL;
BEGIN
  -- Weight factor
  weight_factor := CASE
    WHEN p_weight_kg <= 100 THEN 1.0
    WHEN p_weight_kg <= 500 THEN 1.2
    WHEN p_weight_kg <= 1000 THEN 1.4
    WHEN p_weight_kg <= 5000 THEN 1.6
    ELSE 2.0
  END;
  
  -- Cargo type multiplier
  cargo_multiplier := CASE p_cargo_type
    WHEN 'hazardous' THEN 1.5
    WHEN 'perishable' THEN 1.3
    WHEN 'fragile' THEN 1.25
    WHEN 'livestock' THEN 1.4
    WHEN 'fuel' THEN 1.5
    ELSE 1.0
  END;
  
  total_price := p_distance_km * base_rate * weight_factor * cargo_multiplier;
  
  IF p_is_backhaul THEN
    total_price := total_price * (1 - backhaul_discount);
  END IF;
  
  RETURN ROUND(total_price, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Get user wallet balance
-- ============================================
CREATE OR REPLACE FUNCTION get_wallet_balance(p_user_id UUID)
RETURNS TABLE (
  available DECIMAL,
  pending DECIMAL,
  escrow DECIMAL,
  total DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.available_balance_mwk,
    w.pending_balance_mwk,
    w.escrow_balance_mwk,
    w.available_balance_mwk + w.pending_balance_mwk + w.escrow_balance_mwk
  FROM wallets w
  WHERE w.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Process escrow release
-- ============================================
CREATE OR REPLACE FUNCTION release_escrow(
  p_escrow_id UUID,
  p_release_reason VARCHAR DEFAULT 'delivery_confirmed'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_escrow escrow_holds%ROWTYPE;
BEGIN
  -- Get escrow record
  SELECT * INTO v_escrow
  FROM escrow_holds
  WHERE id = p_escrow_id AND status = 'held';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update escrow status
  UPDATE escrow_holds
  SET 
    status = 'released',
    released_at = NOW()
  WHERE id = p_escrow_id;
  
  -- Update transporter wallet
  UPDATE wallets
  SET 
    available_balance_mwk = available_balance_mwk + v_escrow.net_amount_mwk,
    escrow_balance_mwk = escrow_balance_mwk - v_escrow.net_amount_mwk
  WHERE user_id = v_escrow.transporter_id;
  
  -- Record transaction
  INSERT INTO wallet_transactions (
    user_id,
    type,
    amount_mwk,
    status,
    shipment_id,
    description,
    completed_at
  ) VALUES (
    v_escrow.transporter_id,
    'escrow_release',
    v_escrow.net_amount_mwk,
    'completed',
    v_escrow.shipment_id,
    'Payment released: ' || p_release_reason,
    NOW()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
