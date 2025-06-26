-- Materialized view with key metrics
CREATE MATERIALIZED VIEW kpi_dashboard AS
SELECT
  SUM(CASE WHEN billing_cycle = 'monthly' THEN amount ELSE amount/12 END) AS total_mrr,
  SUM(CASE WHEN billing_cycle = 'yearly' THEN amount ELSE amount*12 END) AS projected_annual,
  0::numeric AS saved_after_cancel -- placeholder
FROM subscriptions
WHERE (next_payment_date > now() - INTERVAL '1 month');

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_kpi_dashboard() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY kpi_dashboard;
END; $$ LANGUAGE plpgsql; 