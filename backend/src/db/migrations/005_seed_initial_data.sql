-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
  ('admin', 'System administrator with full access', '{"all": true}'::jsonb),
  ('branch_manager', 'Branch manager with branch-level access', '{"branch": true, "reports": true}'::jsonb),
  ('loan_officer', 'Loan officer for loan origination and management', '{"loans": true, "customers": true}'::jsonb),
  ('cashier', 'Cashier for transaction recording', '{"transactions": true, "repayments": true}'::jsonb),
  ('staff', 'General staff with limited access', '{"view": true}'::jsonb);

-- Insert default loan products
INSERT INTO loan_products (code, name, description, min_amount, max_amount, base_interest_rate, min_duration_months, max_duration_months, default_duration_months, status) VALUES
  ('PERS', 'Personal Loan', 'Short-term personal loans for individuals', 500.00, 50000.00, 18.00, 3, 36, 12, 'active'),
  ('BUSI', 'Business Loan', 'Loans for small business expansion and working capital', 1000.00, 100000.00, 15.00, 6, 60, 24, 'active'),
  ('AGRI', 'Agricultural Loan', 'Loans for agricultural activities and farming', 2000.00, 75000.00, 12.00, 6, 48, 18, 'active'),
  ('TRAD', 'Trading Loan', 'Loans for trading and commercial activities', 1500.00, 80000.00, 16.00, 3, 36, 12, 'active'),
  ('EMRG', 'Emergency Loan', 'Quick emergency loans for urgent needs', 200.00, 10000.00, 22.00, 1, 12, 6, 'active');

