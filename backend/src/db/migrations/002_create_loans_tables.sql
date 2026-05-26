-- Loans table
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_number VARCHAR(30) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  loan_officer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  loan_product_id UUID NOT NULL REFERENCES loan_products(id) ON DELETE RESTRICT,
  principal_amount DECIMAL(15, 2) NOT NULL CHECK (principal_amount > 0),
  interest_rate DECIMAL(5, 2) NOT NULL CHECK (interest_rate >= 0),
  processing_fee DECIMAL(15, 2) DEFAULT 0 CHECK (processing_fee >= 0),
  insurance_fee DECIMAL(15, 2) DEFAULT 0 CHECK (insurance_fee >= 0),
  term_months INT NOT NULL CHECK (term_months > 0),
  grace_period_days INT DEFAULT 0 CHECK (grace_period_days >= 0),
  application_date DATE NOT NULL,
  approval_date DATE,
  disbursal_date DATE,
  maturity_date DATE NOT NULL,
  repayment_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (repayment_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly')),
  next_repayment_date DATE,
  total_amount_due DECIMAL(15, 2) GENERATED ALWAYS AS (
    principal_amount + (principal_amount * interest_rate / 100) + processing_fee + insurance_fee
  ) STORED,
  amount_paid DECIMAL(15, 2) DEFAULT 0 CHECK (amount_paid >= 0),
  amount_outstanding DECIMAL(15, 2) GENERATED ALWAYS AS (
    total_amount_due - amount_paid
  ) STORED,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'active', 'completed', 'defaulted', 'rejected', 'cancelled'
  )),
  collateral_description TEXT,
  collateral_value DECIMAL(15, 2),
  guarantor_name VARCHAR(100),
  guarantor_phone VARCHAR(20),
  days_overdue INT DEFAULT 0,
  is_overdue BOOLEAN DEFAULT FALSE,
  last_payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Repayment schedule table
CREATE TABLE repayment_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  schedule_number INT NOT NULL,
  principal_amount DECIMAL(15, 2) NOT NULL CHECK (principal_amount > 0),
  interest_amount DECIMAL(15, 2) NOT NULL CHECK (interest_amount >= 0),
  total_amount DECIMAL(15, 2) GENERATED ALWAYS AS (principal_amount + interest_amount) STORED,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'overdue', 'waived')),
  amount_paid DECIMAL(15, 2) DEFAULT 0 CHECK (amount_paid >= 0),
  amount_outstanding DECIMAL(15, 2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  days_overdue INT DEFAULT 0,
  penalty_charge DECIMAL(15, 2) DEFAULT 0 CHECK (penalty_charge >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(loan_id, schedule_number)
);

-- Repayments table
CREATE TABLE repayments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
  repayment_schedule_id UUID REFERENCES repayment_schedule(id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  principal_paid DECIMAL(15, 2) NOT NULL CHECK (principal_paid >= 0),
  interest_paid DECIMAL(15, 2) NOT NULL CHECK (interest_paid >= 0),
  penalty_paid DECIMAL(15, 2) DEFAULT 0 CHECK (penalty_paid >= 0),
  payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN (
    'cash', 'bank_transfer', 'mobile_money', 'check', 'other'
  )),
  reference_number VARCHAR(100),
  recorded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  recorded_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'reversed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

