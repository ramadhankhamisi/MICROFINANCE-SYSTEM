# Microfinance Management System - Database Design

## Overview
Production-ready PostgreSQL schema with UUID keys, normalization, and financial best practices.

## Tables (13 core tables)

### 1. Roles
- Role-based access control
- Permissions stored as JSONB
- Status tracking (active/inactive)

### 2. Branches
- Multi-branch support
- Unique branch codes
- Manager assignment

### 3. Users (Staff)
- Authentication and authorization
- 2FA ready
- Login tracking
- Branch assignment with cascading restrictions

### 4. Customers
- Complete KYC compliance
- Multiple ID types
- Income tracking
- Blacklist support
- Status: active, inactive, blacklisted

### 5. Loan Products
- Loan type definitions
- Min/max amounts
- Duration terms
- Interest rate templates

### 6. Loans (Core)
- Complete loan lifecycle tracking
- Generated columns for calculations
- Overdue tracking
- Status: pending→approved→active→completed
- Financial precision with DECIMAL(15,2)

### 7. Repayment Schedule
- Pre-calculated amortization
- One schedule per loan
- Tracks: principal, interest, due dates
- Penalty charges support

### 8. Repayments
- Actual payment transactions
- Payment method tracking
- Breaks down: principal_paid + interest_paid + penalty_paid
- Recorded by user (audit trail)

### 9. Income
- All revenue sources
- Categories: interest, fees, penalties
- Status: pending→posted
- Links to loans

### 10. Expenses
- Operating expenses
- Status: pending→approved→paid
- Approval workflow
- Recorded and approved by users

### 11. Transactions
- General transaction log
- All types: disbursements, repayments, income, expenses
- Links to related entities
- Comprehensive audit

### 12. Audit Log
- Complete change tracking
- Old and new values (JSONB)
- Who, what, when
- Regulatory compliance

### 13. System Settings
- Configuration management
- Flexible value types

## Key Features

### Financial Precision
- DECIMAL(15, 2) for all money fields
- No floating-point errors
- Range: ±99,999,999,999.99

### Calculated Fields (GENERATED ALWAYS)
```sql
total_amount_due = principal + (principal * rate/100) + fees
amount_outstanding = total_due - amount_paid
```
- Always accurate
- Improved query performance
- Single source of truth

### Status Tracking
Every table has status field for:
- Soft deletes (mark inactive)
- Workflow management
- Reporting filters

### Referential Integrity
```sql
ON DELETE RESTRICT  -- Prevent deletion if related records exist
ON DELETE CASCADE   -- Delete related records
ON DELETE SET NULL  -- Clear foreign key
```

### Audit Trail
Every important table tracks:
- created_at (TIMESTAMP WITH TIME ZONE)
- updated_at (TIMESTAMP WITH TIME ZONE)
- created_by / updated_by / recorded_by (user IDs)

### Indexes (33 total)
Optimized for:
- Email lookups (users, customers)
- Loan queries (customer_id, status, dates)
- Financial reporting (dates, categories)
- Audit queries (entity type, changes)

### Views (4 reporting views)
- v_active_loans - Current portfolio
- v_portfolio_summary - Branch metrics
- v_monthly_revenue - Income analysis
- v_monthly_expenses - Expense analysis

## Loan Lifecycle

```
Customer → Loan Application → Approval → Disbursement → 
Repayments (with schedule) → Completion/Default
```

Each stage has status tracking and audit trail.

## Financial Data Flow

1. Loan disbursed
   - Creates loan record
   - Generates repayment schedule
   - Records transaction

2. Repayment received
   - Records repayment transaction
   - Updates schedule status
   - Updates loan amount_paid
   - Generates income record
   - Updates overdue status

3. Reporting
   - Views aggregate by period, category, branch
   - Reconciliation data available
   - Complete audit trail

## Best Practices Implemented

✅ UUID primary keys
✅ Normalized design (3NF)
✅ Decimal precision for money
✅ Generated columns for calculations
✅ Status-based soft deletes
✅ Comprehensive audit logging
✅ Referential integrity constraints
✅ Performance indexes
✅ Check constraints for validation
✅ Time zone aware timestamps
✅ JSON flexibility (permissions, changes)
✅ Double-entry accounting ready
✅ Overdue tracking
✅ Approval workflows
✅ Multi-branch support
✅ RBAC integration

## Installation

Run migrations in order:
```bash
psql -U postgres -d microfinance_db < 001_create_base_tables.sql
psql -U postgres -d microfinance_db < 002_create_loans_tables.sql
psql -U postgres -d microfinance_db < 003_create_financial_tables.sql
psql -U postgres -d microfinance_db < 004_create_indexes_and_views.sql
psql -U postgres -d microfinance_db < 005_seed_initial_data.sql
```

## Testing

```sql
-- Check overdue loans
SELECT * FROM loans WHERE is_overdue = TRUE;

-- Portfolio summary
SELECT * FROM v_portfolio_summary;

-- Monthly revenue
SELECT * FROM v_monthly_revenue WHERE month = '2024-05-01';

-- Verify repayment totals
SELECT loan_id, 
  SUM(amount) as total_paid,
  MAX(recorded_date) as last_payment
FROM repayments
GROUP BY loan_id;
```

## Security

- Passwords hashed (never stored plain)
- Audit trail for compliance
- Branch isolation
- Role-based access control
- Data validation at DB level

---

**Version**: 1.0
**Last Updated**: 2024-05-22
**Status**: Production Ready
