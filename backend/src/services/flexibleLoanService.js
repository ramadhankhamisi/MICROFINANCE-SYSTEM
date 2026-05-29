import { query } from '../config/database.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import FlexibleLoanCalculationService from './flexibleLoanCalculationService.js';

const toNumber = (value) => Number.parseFloat(value || 0);

export class FlexibleLoanService {
  static async getLoans(branchId, search = '') {
    const params = [branchId];
    let searchClause = '';

    if (search.trim()) {
      params.push(`%${search.trim()}%`);
      searchClause = `AND (
        l.loan_number ILIKE $2 OR
        c.first_name ILIKE $2 OR
        c.last_name ILIKE $2 OR
        c.phone ILIKE $2
      )`;
    }

    const result = await query(
      `SELECT
        l.*,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.phone AS customer_phone
       FROM loans l
       JOIN customers c ON l.customer_id = c.id
       WHERE l.branch_id = $1 ${searchClause}
       ORDER BY l.created_at DESC`,
      params
    );

    return result.rows;
  }

  static async createLoan(loanData, user) {
    const customerId = Number.parseInt(loanData.customer_id, 10);
    const principalAmount = toNumber(loanData.principal_amount);
    const repaymentDays = Number.parseInt(loanData.repayment_days, 10);
    const branchId = user.branchId;

    const customerResult = await query(
      'SELECT id FROM customers WHERE id = $1 AND branch_id = $2 AND status = $3',
      [customerId, branchId, 'active']
    );

    if (customerResult.rows.length === 0) {
      throw new ValidationError('Customer not found');
    }

    const validation = FlexibleLoanCalculationService.validateRepaymentDays(principalAmount, repaymentDays);
    if (!validation.isValid) {
      throw new ValidationError(validation.message);
    }

    const totalDue = FlexibleLoanCalculationService.calculateTotalDue(principalAmount);
    const dailyPayment = FlexibleLoanCalculationService.calculateDailyPayment(principalAmount, repaymentDays);
    const loanNumber = `LN-${Date.now()}`;
    const applicationDate = new Date();
    const maturityDate = new Date(applicationDate);
    maturityDate.setDate(maturityDate.getDate() + repaymentDays);
    const nextRepaymentDate = new Date(applicationDate);
    nextRepaymentDate.setDate(nextRepaymentDate.getDate() + 1);

    const result = await query(
      `INSERT INTO loans (
        loan_number, customer_id, branch_id, loan_officer_id, principal_amount,
        interest_rate, repayment_days, daily_payment, total_amount_due,
        amount_paid, amount_outstanding, application_date, maturity_date,
        next_repayment_date, status, created_by, updated_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $9, $10, $11, $12, $13, $4, $4)
       RETURNING *`,
      [
        loanNumber,
        customerId,
        branchId,
        user.id,
        principalAmount,
        20,
        repaymentDays,
        dailyPayment,
        totalDue,
        applicationDate.toISOString().split('T')[0],
        maturityDate.toISOString().split('T')[0],
        nextRepaymentDate.toISOString().split('T')[0],
        'active',
      ]
    );

    return {
      loan: result.rows[0],
      calculation: {
        principal: principalAmount,
        interest: FlexibleLoanCalculationService.calculateInterest(principalAmount),
        totalDue,
        dailyPayment,
        repaymentDays,
      },
    };
  }

  static async getLoanWithSchedule(loanId, branchId) {
    const result = await query(
      `SELECT
        l.*,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.phone AS customer_phone
       FROM loans l
       JOIN customers c ON l.customer_id = c.id
       WHERE l.id = $1 AND l.branch_id = $2`,
      [loanId, branchId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Loan not found');
    }

    const repayments = await query(
      'SELECT * FROM repayments WHERE loan_id = $1 ORDER BY transaction_date DESC, created_at DESC',
      [loanId]
    );

    return {
      loan: result.rows[0],
      repayments: repayments.rows,
    };
  }

  static async recordRepayment(repaymentData, recordedBy) {
    const loanId = Number.parseInt(repaymentData.loan_id, 10);
    const amount = toNumber(repaymentData.amount);
    const { transaction_date, payment_method = 'cash' } = repaymentData;

    const loanResult = await query('SELECT * FROM loans WHERE id = $1', [loanId]);
    if (loanResult.rows.length === 0) {
      throw new NotFoundError('Loan not found');
    }

    const loan = loanResult.rows[0];
    const outstanding = toNumber(loan.amount_outstanding);

    if (amount <= 0) {
      throw new ValidationError('Repayment amount must be greater than zero');
    }

    if (amount > outstanding) {
      throw new ValidationError('Repayment amount exceeds outstanding balance');
    }

    const repaymentResult = await query(
      `INSERT INTO repayments (loan_id, transaction_date, amount, payment_method, recorded_by, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [loanId, transaction_date, amount, payment_method, recordedBy, 'completed']
    );

    const newAmountPaid = toNumber(loan.amount_paid) + amount;
    const newOutstanding = Math.max(toNumber(loan.total_amount_due) - newAmountPaid, 0);
    const status = newOutstanding <= 0 ? 'completed' : 'active';
    const nextDate = new Date(transaction_date);
    nextDate.setDate(nextDate.getDate() + 1);

    await query(
      `UPDATE loans
       SET amount_paid = $1,
           amount_outstanding = $2,
           last_payment_date = $3,
           next_repayment_date = $4,
           status = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [newAmountPaid, newOutstanding, transaction_date, nextDate.toISOString().split('T')[0], status, loanId]
    );

    await query(
      `INSERT INTO transactions (transaction_type, category, amount, branch_id, description, transaction_date, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['income', 'loan_repayment', amount, loan.branch_id, `Repayment for ${loan.loan_number}`, transaction_date, recordedBy]
    );

    return {
      repayment: repaymentResult.rows[0],
      loanUpdate: {
        amountPaid: newAmountPaid,
        amountOutstanding: newOutstanding,
        status,
      },
    };
  }
}

export default FlexibleLoanService;
