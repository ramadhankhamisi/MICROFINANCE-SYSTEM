import { query } from '../config/database.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import LoanCalculationService from './loanCalculationService.js';

export class LoanService {
  static async createLoan(loanData, userId) {
    const {
      customer_id,
      branch_id,
      loan_officer_id,
      loan_product_id,
      principal_amount,
    } = loanData;

    const customerResult = await query(
      'SELECT id FROM customers WHERE id = $1 AND branch_id = $2',
      [customer_id, branch_id]
    );
    
    if (customerResult.rows.length === 0) {
      throw new ValidationError('Customer not found');
    }

    const productResult = await query(
      'SELECT * FROM loan_products WHERE id = $1',
      [loan_product_id]
    );
    
    if (productResult.rows.length === 0) {
      throw new ValidationError('Loan product not found');
    }

    const product = productResult.rows[0];
    
    if (principal_amount < product.min_amount || principal_amount > product.max_amount) {
      throw new ValidationError(
        `Amount must be ${product.min_amount} - ${product.max_amount}`
      );
    }

    const repaymentDays = product.repayment_days;
    const totalDue = LoanCalculationService.calculateTotalDue(principal_amount);
    const dailyPayment = LoanCalculationService.calculateDailyPayment(principal_amount, repaymentDays);
    const loanNumber = `LOAN-${Date.now()}`.toUpperCase();
    
    const applicationDate = new Date();
    const maturityDate = new Date(applicationDate);
    maturityDate.setDate(maturityDate.getDate() + repaymentDays);

    const loanResult = await query(
      `INSERT INTO loans (
        loan_number, customer_id, branch_id, loan_officer_id, loan_product_id,
        principal_amount, interest_rate, term_months, repayment_frequency,
        application_date, maturity_date, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        loanNumber, customer_id, branch_id, loan_officer_id, loan_product_id,
        principal_amount, product.interest_rate, repaymentDays, 'daily',
        applicationDate.toISOString().split('T')[0],
        maturityDate.toISOString().split('T')[0],
        'pending', userId
      ]
    );

    const loanId = loanResult.rows[0].id;
    
    const schedule = LoanCalculationService.generateDailySchedule({
      principal_amount,
      disbursal_date: applicationDate.toISOString().split('T')[0],
      repayment_days: repaymentDays,
    });

    for (const item of schedule) {
      await query(
        `INSERT INTO repayment_schedule (
          loan_id, day_number, principal_amount, interest_amount, 
          due_date, status
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [loanId, item.day_number, item.principal_amount, item.interest_amount, 
         item.due_date, item.status]
      );
    }

    return {
      loan: loanResult.rows[0],
      calculation: {
        principal: principal_amount,
        interest: LoanCalculationService.calculateInterest(principal_amount),
        totalDue: totalDue,
        dailyPayment: dailyPayment,
        repaymentDays: repaymentDays,
      },
    };
  }

  static async recordRepayment(repaymentData, recordedBy) {
    const { loan_id, amount, transaction_date } = repaymentData;

    const loanResult = await query('SELECT * FROM loans WHERE id = $1', [loan_id]);
    if (loanResult.rows.length === 0) throw new NotFoundError('Loan not found');

    const loan = loanResult.rows[0];

    const scheduleResult = await query(
      `SELECT * FROM repayment_schedule 
       WHERE loan_id = $1 AND status IN ('pending', 'overdue')
       ORDER BY day_number ASC LIMIT 1`,
      [loan_id]
    );

    if (scheduleResult.rows.length === 0) {
      throw new ValidationError('No pending repayments');
    }

    const schedule = scheduleResult.rows[0];
    const newAmountPaid = parseFloat(loan.amount_paid) + parseFloat(amount);

    await query(
      'UPDATE repayment_schedule SET status = $1, paid_date = $2 WHERE id = $3',
      ['paid', transaction_date, schedule.id]
    );

    await query(
      'UPDATE loans SET amount_paid = $1, last_payment_date = $2 WHERE id = $3',
      [newAmountPaid, transaction_date, loan_id]
    );

    if (newAmountPaid >= loan.total_amount_due) {
      await query('UPDATE loans SET status = $1 WHERE id = $2', ['completed', loan_id]);
    }

    return { success: true, amountPaid: newAmountPaid };
  }
}

export default LoanService;
