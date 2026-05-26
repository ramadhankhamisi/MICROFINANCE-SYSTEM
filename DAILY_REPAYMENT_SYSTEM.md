# Daily Repayment System Documentation

## Overview
Flexible daily repayment loan system with fixed 20% interest rate and tier-based repayment periods.

## System Features

### 1. Fixed 20% Interest Rate
- All loans charge exactly 20% interest
- Simple interest calculation
- No compounding

### 2. Tier-Based Repayment Days

| Tier | Amount Range | Repayment Days | Example |
|------|---|---|---|
| **Tier 1** | 10,000 - 100,000 | 30 days | 100k → 4k/day |
| **Tier 2** | 100,001 - 500,000 | 35 days | 500k → 14.3k/day |
| **Tier 3** | 500,001 - 1,000,000 | 40 days | 1M → 30k/day |
| **Tier 4** | 1,000,001 - 5,000,000 | 50 days | 5M → 120k/day |
| **Tier 5** | 5,000,001 - 10,000,000 | 60 days | 10M → 200k/day |

### 3. Calculation Formula

```
Total Amount Due = Principal × 1.20
Daily Payment = Total Amount Due ÷ Repayment Days
Daily Interest = Total Interest ÷ Repayment Days
Daily Principal = Principal ÷ Repayment Days
```

### 4. Examples

**Example 1: 100,000 TSH (30 days)**
```
Principal: 100,000 TSH
Interest (20%): 20,000 TSH
Total Due: 120,000 TSH
Repayment Period: 30 days
Daily Payment: 120,000 ÷ 30 = 4,000 TSH
Daily Principal: 100,000 ÷ 30 = 3,333.33 TSH
Daily Interest: 20,000 ÷ 30 = 666.67 TSH
```

**Example 2: 1,000,000 TSH (40 days)**
```
Principal: 1,000,000 TSH
Interest (20%): 200,000 TSH
Total Due: 1,200,000 TSH
Repayment Period: 40 days
Daily Payment: 1,200,000 ÷ 40 = 30,000 TSH
Daily Principal: 1,000,000 ÷ 40 = 25,000 TSH
Daily Interest: 200,000 ÷ 40 = 5,000 TSH
```

## Database Schema Changes

### Loan Products Table
```sql
- min_amount: Tier minimum
- max_amount: Tier maximum
- interest_rate: 20.00 (fixed)
- repayment_days: Days based on tier
- repayment_frequency: 'daily'
```

### Loans Table
```sql
- term_months: Stores repayment days (renamed conceptually)
- daily_payment: GENERATED = (principal * 1.20) / repayment_days
- repayment_days: Number of days to repay
- repayment_frequency: Always 'daily'
```

### Repayment Schedule
```sql
- day_number: 1, 2, 3... (daily instead of monthly)
- principal_amount: Daily portion of principal
- interest_amount: Daily portion of interest
- total_amount: principal + interest
- due_date: Calculated daily
```

## Implementation

### 1. Create Loan
```javascript
const loanData = {
  customer_id: uuid,
  branch_id: uuid,
  loan_officer_id: uuid,
  loan_product_id: uuid,
  principal_amount: 100000
};

// System automatically:
// 1. Determines tier based on amount (→ 30 days)
// 2. Calculates: total_due = 120,000
// 3. Calculates: daily_payment = 4,000
// 4. Generates: 30 repayment schedule records (days 1-30)
// 5. Sets: next_repayment_date = tomorrow
```

### 2. Record Daily Repayment
```javascript
const repayment = {
  loan_id: uuid,
  amount: 4000,
  transaction_date: '2024-05-23',
  payment_method: 'cash'
};

// System automatically:
// 1. Gets next pending schedule day
// 2. Splits: principal_paid + interest_paid
// 3. Updates: loan amount_paid, next_repayment_date
// 4. Records: transaction, income
// 5. Checks: if completed, updates status
```

### 3. Key Calculations

**Get loan tier info:**
```javascript
LoanCalculationService.getLoanTierInfo(100000)
// Returns:
{
  tierName: "Tier 1: Entry Level",
  repaymentDays: 30,
  dailyPayment: 4000,
  totalDue: 120000,
  interest: 20000
}
```

**Verify calculation:**
```javascript
LoanCalculationService.verifyCalculation(loanRecord)
// Returns: Validation that all calculations are correct
```

## Daily Repayment Schedule Example

For 100,000 TSH loan (30 days):

| Day | Due Date | Principal | Interest | Total | Status |
|-----|----------|-----------|----------|-------|--------|
| 1 | 2024-05-24 | 3,333.33 | 666.67 | 4,000 | pending |
| 2 | 2024-05-25 | 3,333.33 | 666.67 | 4,000 | pending |
| 3 | 2024-05-26 | 3,333.33 | 666.67 | 4,000 | pending |
| ... | ... | ... | ... | ... | ... |
| 30 | 2024-06-22 | 3,333.34 | 666.66 | 4,000 | pending |

(Last day adjusted for rounding to ensure exact total)

## Loan Status Flow

```
pending (awaiting approval)
  ↓
approved (approved by manager)
  ↓
active (disbursed, repayment started)
  ├─→ [Daily repayments recorded]
  ├─→ [Schedule updated]
  ├─→ [Overdue tracking]
  ↓
completed (all repayments made)
  OR
defaulted (payment default)
```

## Overdue Tracking

**System tracks overdue at 3 levels:**

1. **Schedule Level** - Individual day payment status
   ```sql
   SELECT * FROM repayment_schedule 
   WHERE due_date < TODAY() AND status != 'paid'
   ```

2. **Loan Level** - Any payment overdue
   ```sql
   SELECT * FROM loans WHERE is_overdue = TRUE
   ```

3. **Portfolio Level** - Branch overdue count
   ```sql
   SELECT COUNT(*) FROM loans 
   WHERE branch_id = $1 AND is_overdue = TRUE
   ```

**Penalty Calculation (Optional):**
```
Penalty = Principal × 1% × Days Overdue
Example: 100,000 TSH × 1% × 5 days overdue = 5,000 TSH
```

## Advantages of Daily Repayment System

✅ **Flexible** - Repayment period adjusts based on loan size
✅ **Fair** - Larger loans get longer to repay
✅ **Predictable** - Fixed 20% interest rate
✅ **Simple** - Daily payments are consistent
✅ **Scalable** - Supports 10k to 10M TSH loans
✅ **Auditable** - Complete daily payment schedule
✅ **Compliant** - Transparent fee structure
✅ **Recoverable** - Easier to track daily vs monthly

## API Endpoints

### Create Loan
```
POST /api/loans
{
  "customer_id": "uuid",
  "principal_amount": 100000,
  "branch_id": "uuid",
  "loan_officer_id": "uuid"
}

Returns:
{
  "loan": {...},
  "calculation": {
    "dailyPayment": 4000,
    "totalDue": 120000,
    "repaymentDays": 30
  },
  "schedule": [first 5 days...]
}
```

### Record Repayment
```
POST /api/repayments
{
  "loan_id": "uuid",
  "amount": 4000,
  "transaction_date": "2024-05-23",
  "payment_method": "cash"
}

Returns:
{
  "repayment": {...},
  "loanUpdate": {
    "amountPaid": 4000,
    "amountOutstanding": 116000,
    "daysPaid": 1
  }
}
```

### Get Loan Details
```
GET /api/loans/{id}

Returns:
{
  "loan": {...},
  "schedule": [all 30 days...],
  "summary": {
    "dailyPayment": 4000,
    "daysCompleted": 1,
    "daysRemaining": 29
  }
}
```

---

**Version**: 1.0
**Status**: Ready for implementation
**Last Updated**: 2024-05-22
