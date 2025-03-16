-- Add activity log indexes
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Create view for activity summary
CREATE VIEW activity_summary AS
SELECT 
  user_id,
  entity_type,
  action,
  COUNT(*) as action_count,
  date_trunc('day', created_at) as day
FROM activity_logs
GROUP BY user_id, entity_type, action, date_trunc('day', created_at);
