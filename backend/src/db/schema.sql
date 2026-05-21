-- Branches Table
CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  address TEXT,
  city VARCHAR(100),
  phone VARCHAR(20),
  manager_id INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users/Staff Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  branch_id INTEGER NOT NULL REFERENCES branches(id),
  role VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  national_id VARCHAR(50) NOT NULL,
  date_of_birth DATE,
  address TEXT,
  branch_id INTEGER NOT NULL REFERENCES branches(id),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(national_id, branch_id)
);

-- Loans Table
CREATE TABLE IF NOT EXISTS loans (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  branch_id INTEGER NOT NULL REFERENCES branches(id),
  loan_officer_id INTEGER REFERENCES users(id),
  amount DECIMAL(15, 2) NOT NULL,
  loan_type VARCHAR(50) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  term_months INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  disbursal_date DATE,
  maturity_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Repayments Table
CREATE TABLE IF NOT EXISTS repayments (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(id),
  payment_date DATE NOT NULL,
  principal_amount DECIMAL(15, 2) NOT NULL,
  interest_amount DECIMAL(15, 2) NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  recorded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL REFERENCES branches(id),
  transaction_type VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  reference_number VARCHAR(100),
  transaction_date DATE DEFAULT CURRENT_DATE,
  recorded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_customers_branch_id ON customers(branch_id);
CREATE INDEX idx_loans_customer_id ON loans(customer_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_repayments_loan_id ON repayments(loan_id);
CREATE INDEX idx_transactions_branch_id ON transactions(branch_id);
