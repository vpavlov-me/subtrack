-- Exchange rates cache
CREATE TABLE currency_rates (
  base char(3) NOT NULL,
  target char(3) NOT NULL,
  rate numeric NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (base, target)
);

-- Alter subscriptions for amount/currency
ALTER TABLE subscriptions
  RENAME COLUMN price TO amount,
  RENAME COLUMN next_billing_date TO next_payment_date;

ALTER TABLE subscriptions
  ALTER COLUMN amount TYPE numeric(12,2);

-- currency char(3) already exists; ensure length
ALTER TABLE subscriptions
  ALTER COLUMN currency TYPE char(3); 