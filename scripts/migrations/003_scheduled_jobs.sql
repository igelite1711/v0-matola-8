-- Migration 003: Scheduled Jobs Setup
-- Using pg_cron extension for scheduled data cleanup
-- Note: pg_cron must be enabled by database administrator

-- ============================================
-- SCHEDULED JOBS (requires pg_cron extension)
-- Run these manually if pg_cron is not available
-- ============================================

-- Clean old USSD sessions every hour
-- SELECT cron.schedule('clean-ussd-sessions', '0 * * * *', 'SELECT clean_old_ussd_sessions()');

-- Clean old audit logs daily at 3 AM
-- SELECT cron.schedule('clean-audit-logs', '0 3 * * *', 'SELECT clean_old_audit_logs()');

-- Expire old pending matches (24 hours)
-- SELECT cron.schedule('expire-matches', '*/15 * * * *', $$
--   UPDATE matches 
--   SET status = 'expired' 
--   WHERE status = 'pending' 
--     AND matched_at < NOW() - INTERVAL '24 hours'
-- $$);

-- ============================================
-- ALTERNATIVE: Manual cleanup procedure
-- Call this from application scheduled task
-- ============================================
CREATE OR REPLACE FUNCTION run_scheduled_cleanup()
RETURNS TABLE (
  ussd_sessions_deleted INTEGER,
  audit_logs_deleted INTEGER,
  matches_expired INTEGER
) AS $$
DECLARE
  v_ussd INTEGER;
  v_audit INTEGER;
  v_matches INTEGER;
BEGIN
  -- Clean USSD sessions
  SELECT clean_old_ussd_sessions() INTO v_ussd;
  
  -- Clean audit logs
  SELECT clean_old_audit_logs() INTO v_audit;
  
  -- Expire old pending matches
  UPDATE matches 
  SET status = 'expired' 
  WHERE status = 'pending' 
    AND matched_at < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS v_matches = ROW_COUNT;
  
  RETURN QUERY SELECT v_ussd, v_audit, v_matches;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATA RETENTION POLICY DOCUMENTATION
-- ============================================
COMMENT ON FUNCTION clean_old_ussd_sessions() IS 
  'Deletes USSD sessions older than 7 days. 
   Should be run hourly for optimal performance.
   PRD Requirement: USSD session data retention = 7 days';

COMMENT ON FUNCTION clean_old_audit_logs() IS 
  'Deletes non-critical audit logs older than 30 days.
   Payment and user audit logs are retained indefinitely.
   Should be run daily during low-traffic hours.
   PRD Requirement: Audit log retention = 30 days (non-critical)';
