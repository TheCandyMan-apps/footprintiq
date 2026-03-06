UPDATE scans s
SET status = 'completed'
WHERE status = 'completed_empty'
AND EXISTS (
  SELECT 1 FROM findings f WHERE f.scan_id = s.id
);