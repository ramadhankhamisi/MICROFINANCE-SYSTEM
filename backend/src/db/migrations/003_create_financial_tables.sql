-- Income table
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  description TEXT,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  transaction_date DATE NOT NULL,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
  recorded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(20) DEFAULT 'posted' CHECK (status IN ('pending', 'posted', 'reversed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  transaction_date DATE NOT NULL,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  recorded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  approval_date DATE,
  approval_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- General transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN (
    'loan_disbursement', 'loan_repayment', 'income', 'expense', 
    'transfer', 'adjustment', 'reversal', 'other'
  )),
  amount DECIMAL(15, 2) NOT NULL,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  description TEXT,
  reference_number VARCHAR(100),
  transaction_date DATE NOT NULL,
  recorded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(20) DEFAULT 'posted' CHECK (status IN ('pending', 'posted', 'reversed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'approve', 'reject')),
  old_values JSONB,
  new_values JSONB,
  changes_summary TEXT,
  changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System settings
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  value_type VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

