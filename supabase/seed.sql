-- Insert sample subscriptions
INSERT INTO subscriptions (name, price, billing_cycle, next_billing_date)
VALUES
  ('Netflix', 15.99, 'monthly', NOW() + INTERVAL '1 month'),
  ('Figma', 12.00, 'monthly', NOW() + INTERVAL '1 month'),
  ('Spotify', 9.99, 'monthly', NOW() + INTERVAL '1 month'); 