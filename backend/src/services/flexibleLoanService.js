import { query } from '../config/database.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import FlexibleLoanCalculationService from './flexibleLoanCalculationService.js';

export class FlexibleLoanService {
  static async createLoan(loanData, userId) {
    const { customer_id, branch_id, loan_officer_id, principal_amount, repayment_days } = loanData;

    const customerResult = await query(
      'SELECT id FROM customers WHERE id = $1 AND branch_id = $2 AND status = $3',
      [customer_id, branch_id, 'active']
    );
    
    if (customerResult.rows.length === 0) {
      throw new ValidationError('Customer not found');
    }

    const validation = FlexibleLoanCalculationService.validateRepaymentDays(principal_amount, repayment_days);
    if (!validation.isValid) throw new ValidationError(validation.message);

    const totalDue = FlexibleLoanCalculationService.calculateTotalDue(principal_amount);
    const dailyPayment = FlexibleLoanCalculationService.calculateDailyPayment(principal_amount, repayment_days);
    const loanNumber = `LOAN-${Date.now()}`.toUpperCase();
    const applicationDate = new Date();
    const maturityDate = new Date(applicationDate);
    maturityDate.setDate(maturityDate.getDate() + repayment_days);

    const loanResult = await query(
      `INSERT INTO loans (loan_number, customer_id, branch_id, loan_officer_id, principal_amount, 
        interest_rate, term_months, repayment_frequency, repayment_days, application_date, 
        maturity_date, next_repayment_date, status, created_by, updated_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [loanNumber, customer_id, branch_id, loan_officer_id, principal_amount, 20.00, repayment_days, 
       'daily', repayment_days, applicationDate.toISOString().split('T')[0], 
       maturityDate.toISOString().split('T')[0], new Date(applicationDate.getTime() + 86400000).toISOString().split('T')[0],
       'pending', userId, userId]
    );

    const loanId = loanResult.rows[0].id;
    const schedule = FlexibleLoanCalculationService.generateDailySchedule({
      principal_amount, disbursal_date: applicationDate.toISOString().split('T')[0], repayment_days
    });

    for (const item of schedule) {
      await query(
        `INSERT INTO repayment_schedule (loan_id, day_number, principal_amount, interest_amount, due_date, status) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [loanId, item.day_number, item.principal_amount, item.interest_amount, item.due_date, item.status]
      );
    }

    return { loan: loanResult.rows[0], calculation: { principal: principal_amount, 
      interest: FlexibleLoanCalculationService.calculateInterest(principal_amount), totalDue, dailyPayment, repaymentDays }, 
      schedule: schedule.slice(0, 5), scheduleTotal: schedule.length };
  }

  static async getLoanWithSchedule(loanId, branchId) {
    const loanResult = await query(
      `SELECT l.*, c.first_name, c.last_name, c.phone FROM loans l 
       JOIN customers c ON l.customer_id = c.id WHERE l.id = $1 AND l.branch_id = $2`,
      [loanId, branchId]
    );

    if (loanResult.rows.length === 0) throw new NotFoundError('Loan not found');

    const loan = loanResult.rows[0];
    const scheduleResult = await query(
      `SELECT * FROM repayment_schedule WHERE loan_id = $1 ORDER BY day_number ASC`, [loanId]
    );

    return {
      loan,
      schedule: scheduleResult.rows,
      summary: {
        principal: loan.principal_amount, totalDue: loan.total_amount_due, amountPaid: loan.amount_paid,
        amountOutstanding: loan.amount_outstanding, dailyPayment: loan.daily_payment, repaymentDays: loan.repayment_days,
        daysPaid: Math.round((loan.amount_paid / loan.daily_payment) * 100) / 100,
        daysRemaining: Math.round((loan.amount_outstanding / loan.daily_payment) * 100) / 100
      }
    };
  }

  static async getCustomerLoans(customerId, branchId) {
    const result = await query(
      `SELECT * FROM loans WHERE customer_id = $1 AND branch_id = $2 AND status IN ('active', 'completed') ORDER BY created_at DESC`,
      [customerId, branchId]
    );
    return result.rows;
  }

  static async recordRepayment(repaymentData, recordedBy) {
    const { loan_id, amount, transaction_date, payment_method = 'cash' } = repaymentData;

    const loanResult = await query('SELECT * FROM loans WHERE id = $1', [loan_id]);
    if (loanResult.rows.length === 0) throw new NotFoundError('Loan not found');

    const loan = loanResult.rows[0];
    const scheduleResult = await query(
      `SELECT * FROM repayment_schedule WHERE loan_id = $1 AND status IN ('pending', 'overdue') ORDER BY day_number ASC LIMIT 1`,
      [loan_id]
    );

    if (scheduleResult.rows.length === 0) throw new ValidationError('No pending repayments');

    const schedule = scheduleResult.rows[0];

    const repaymentResult = await query(
      `INSERT INTO repayments (loan_id, repayment_schedule_id, transaction_date, amount, principal_paid, interest_paid, payment_method, recorded_by, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [loan_id, schedule.id, transaction_date, amount, schedule.principal_amount, schedule.interest_amount, payment_method, recordedBy, 'completed']
    );

    await query('UPDATE repayment_schedule SET status = $1, paid_date = $2 WHERE id = $3', ['paid', transaction_date, schedule.id]);

    const newAmountPaid = parseFloat(loan.amount_paid) + parseFloat(amount);
    const nextDate = new Date(transaction_date);
    nextDate.setDate(nextDate.getDate() + 1);

    await query(
      `UPDATE loans SET amount_paid = $1, last_payment_date = $2, next_repayment_date = $3, updated_at = NOW() WHERE id = $4`,
      [newAmountPaid, transaction_date, nextDate.toISOString().split('T')[0], loan_id]
    );

    await query(
      `INSERT INTO transactions (transaction_type, amount, branch_id, related_entity_type, related_entity_id, description, transaction_date, recorded_by, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      ['loan_repayment', amount, loan.branch_id, 'loan', loan_id, `Repayment for ${loan.loan_number}`, transaction_date, recordedBy, 'posted']
    );

    await query(
      `INSERT INTO income (category, amount, transaction_date, branch_id, loan_id, recorded_by, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['interest_income', schedule.interest_amount, transaction_date, loan.branch_id, loan_id, recordedBy, 'posted']
    );

    if (newAmountPaid >= loan.total_amount_due) {
      await query('UPDATE loans SET status = $1 WHERE id = $2', ['completed', loan_id]);
    }

    return { repayment: repaymentResult.rows[0], loanUpdate: { amountPaid: newAmountPaid, 
      amountOutstanding: loan.total_amount_due - newAmountPaid, status: newAmountPaid >= loan.total_amount_due ? 'completed' : 'active' }};
  }
}

export default FlexibleLoanService;
