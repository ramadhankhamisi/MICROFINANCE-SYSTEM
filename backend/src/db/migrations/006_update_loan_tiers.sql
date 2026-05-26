-- Drop old loan_products table (no data yet)
DROP TABLE IF EXISTS loan_products CASCADE;

-- Recreate with tier system
CREATE TABLE loan_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Loan amount tier
  min_amount DECIMAL(15, 2) NOT NULL,
  max_amount DECIMAL(15, 2) NOT NULL,
  
  -- Fixed 20% interest rate
  interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
  
  -- Daily repayment configuration
  repayment_days INT NOT NULL, -- Number of days to repay
  repayment_frequency VARCHAR(20) DEFAULT 'daily', -- Always daily
  
  -- Configuration
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  requires_collateral BOOLEAN DEFAULT FALSE,
  requires_guarantor BOOLEAN DEFAULT FALSE,
  grace_period_days INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert loan tiers with flexible repayment days based on amount
INSERT INTO loan_products (code, name, description, min_amount, max_amount, interest_rate, repayment_days) VALUES
  ('TIER1', 'Tier 1: Entry Level', 'For new customers starting their microfinance journey', 10000.00, 100000.00, 20.00, 30),
  ('TIER2', 'Tier 2: Growing Business', 'For established customers expanding their business', 100001.00, 500000.00, 20.00, 35),
  ('TIER3', 'Tier 3: Medium Business', 'For medium-scale businesses', 500001.00, 1000000.00, 20.00, 40),
  ('TIER4', 'Tier 4: Large Business', 'For large-scale business operations', 1000001.00, 5000000.00, 20.00, 50),
  ('TIER5', 'Tier 5: Enterprise', 'For enterprise-level clients', 5000001.00, 10000000.00, 20.00, 60);

-- Update Loans table to remove some fields and add daily calculations
ALTER TABLE loans 
  DROP COLUMN IF EXISTS processing_fee,
  DROP COLUMN IF EXISTS insurance_fee,
  DROP COLUMN IF EXISTS grace_period_days,
  ADD COLUMN daily_payment DECIMAL(15, 2) GENERATED ALWAYS AS (
    ROUND(principal_amount * 1.20 / term_months, 2)
  ) STORED,
  ADD COLUMN repayment_days INT;

-- Ensure repayment_frequency is always daily
UPDATE loans SET repayment_frequency = 'daily';

-- Update repayment schedule to have daily records
-- Recalculate schedule_number to represent day number instead of month
ALTER TABLE repayment_schedule
  DROP COLUMN IF EXISTS schedule_number CASCADE,
  ADD COLUMN day_number INT NOT NULL,
  ADD UNIQUE(loan_id, day_number);

-- Drop old constraint if exists
ALTER TABLE repayment_schedule 
  DROP CONSTRAINT IF EXISTS "unique_loan_id_schedule_number";

