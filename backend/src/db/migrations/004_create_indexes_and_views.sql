-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status ON users(status);

-- Customer indexes
CREATE INDEX idx_customers_branch_id ON customers(branch_id);
CREATE INDEX idx_customers_national_id ON customers(national_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_assigned_officer_id ON customers(assigned_officer_id);

-- Loan indexes
CREATE INDEX idx_loans_customer_id ON loans(customer_id);
CREATE INDEX idx_loans_branch_id ON loans(branch_id);
CREATE INDEX idx_loans_loan_officer_id ON loans(loan_officer_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_disbursal_date ON loans(disbursal_date);
CREATE INDEX idx_loans_maturity_date ON loans(maturity_date);
CREATE INDEX idx_loans_is_overdue ON loans(is_overdue);
CREATE INDEX idx_loans_application_date ON loans(application_date);
CREATE INDEX idx_loans_loan_number ON loans(loan_number);

-- Repayment schedule indexes
CREATE INDEX idx_repayment_schedule_loan_id ON repayment_schedule(loan_id);
CREATE INDEX idx_repayment_schedule_status ON repayment_schedule(status);
CREATE INDEX idx_repayment_schedule_due_date ON repayment_schedule(due_date);

-- Repayment indexes
CREATE INDEX idx_repayments_loan_id ON repayments(loan_id);
CREATE INDEX idx_repayments_transaction_date ON repayments(transaction_date);
CREATE INDEX idx_repayments_status ON repayments(status);
CREATE INDEX idx_repayments_recorded_by ON repayments(recorded_by);

-- Income indexes
CREATE INDEX idx_income_branch_id ON income(branch_id);
CREATE INDEX idx_income_category ON income(category);
CREATE INDEX idx_income_transaction_date ON income(transaction_date);
CREATE INDEX idx_income_loan_id ON income(loan_id);

-- Expense indexes
CREATE INDEX idx_expenses_branch_id ON expenses(branch_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_transaction_date ON expenses(transaction_date);
CREATE INDEX idx_expenses_status ON expenses(status);

-- Transaction indexes
CREATE INDEX idx_transactions_branch_id ON transactions(branch_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Audit log indexes
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_changed_by ON audit_log(changed_by);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Views for reporting
CREATE VIEW v_active_loans AS
SELECT 
  l.id,
  l.loan_number,
  c.first_name,
  c.last_name,
  l.principal_amount,
  l.interest_rate,
  l.amount_paid,
  l.amount_outstanding,
  l.next_repayment_date,
  l.days_overdue,
  l.status
FROM loans l
JOIN customers c ON l.customer_id = c.id
WHERE l.status = 'active';

CREATE VIEW v_portfolio_summary AS
SELECT 
  b.id,
  b.name,
  COUNT(DISTINCT l.id) as total_loans,
  COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.id END) as active_loans,
  SUM(l.principal_amount) as total_disbursed,
  SUM(l.amount_outstanding) as total_outstanding,
  SUM(CASE WHEN l.is_overdue THEN 1 ELSE 0 END) as overdue_count
FROM branches b
LEFT JOIN loans l ON b.id = l.branch_id
GROUP BY b.id, b.name;

CREATE VIEW v_monthly_revenue AS
SELECT 
  DATE_TRUNC('month', i.transaction_date)::DATE as month,
  i.category,
  SUM(i.amount) as total_amount
FROM income i
WHERE i.status = 'posted'
GROUP BY DATE_TRUNC('month', i.transaction_date), i.category;

CREATE VIEW v_monthly_expenses AS
SELECT 
  DATE_TRUNC('month', e.transaction_date)::DATE as month,
  e.category,
  SUM(e.amount) as total_amount
FROM expenses e
WHERE e.status IN ('approved', 'paid')
GROUP BY DATE_TRUNC('month', e.transaction_date), e.category;

