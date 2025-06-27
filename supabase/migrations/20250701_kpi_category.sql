-- Materialized view for category analytics
CREATE MATERIALIZED VIEW kpi_category AS
SELECT
  category,
  COUNT(*) as subscription_count,
  SUM(CASE WHEN billing_cycle = 'monthly' THEN price ELSE price/12 END) as monthly_revenue,
  SUM(CASE WHEN billing_cycle = 'yearly' THEN price ELSE price*12 END) as yearly_revenue,
  AVG(price) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price,
  COUNT(DISTINCT user_id) as unique_users
FROM subscriptions
WHERE category IS NOT NULL AND category != ''
GROUP BY category
ORDER BY monthly_revenue DESC;

-- Create index for better performance
CREATE INDEX idx_kpi_category_category ON kpi_category(category);
CREATE INDEX idx_kpi_category_monthly_revenue ON kpi_category(monthly_revenue DESC);

-- Function to refresh category analytics
CREATE OR REPLACE FUNCTION refresh_category_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY kpi_category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION refresh_category_analytics() TO authenticated;

-- Function to get category analytics for a specific user
CREATE OR REPLACE FUNCTION get_user_category_analytics(user_id_param UUID)
RETURNS TABLE (
  category TEXT,
  subscription_count BIGINT,
  monthly_revenue NUMERIC,
  yearly_revenue NUMERIC,
  avg_price NUMERIC,
  min_price NUMERIC,
  max_price NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.category,
    COUNT(*)::BIGINT as subscription_count,
    SUM(CASE WHEN s.billing_cycle = 'monthly' THEN s.price ELSE s.price/12 END) as monthly_revenue,
    SUM(CASE WHEN s.billing_cycle = 'yearly' THEN s.price ELSE s.price*12 END) as yearly_revenue,
    AVG(s.price) as avg_price,
    MIN(s.price) as min_price,
    MAX(s.price) as max_price
  FROM subscriptions s
  WHERE s.user_id = user_id_param 
    AND s.category IS NOT NULL 
    AND s.category != ''
  GROUP BY s.category
  ORDER BY monthly_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_category_analytics(UUID) TO authenticated; 