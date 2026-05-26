import { FlexibleLoanService } from '../services/flexibleLoanService.js';
import FlexibleLoanCalculationService from '../services/flexibleLoanCalculationService.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export class FlexibleLoanController {
  /**
   * Get calculation preview for loan
   * Used by frontend to show live calculations
   */
  static async getCalculationPreview(req, res, next) {
    try {
      const { amount, repayment_days } = req.query;
      const principal = parseFloat(amount);
      const days = parseInt(repayment_days);

      const preview = FlexibleLoanCalculationService.getLoanCalculationPreview(
        principal,
        days
      );

      sendSuccess(res, preview, 'Calculation preview retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get repayment range recommendation
   */
  static async getRepaymentRange(req, res, next) {
    try {
      const { amount } = req.query;
      const principal = parseFloat(amount);

      const range = FlexibleLoanCalculationService.getRepaymentRange(principal);

      sendSuccess(res, range, 'Repayment range retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create loan with flexible repayment days
   */
  static async create(req, res, next) {
    try {
      const loanData = req.body;
      const result = await FlexibleLoanService.createLoan(loanData, req.user.id);
      sendSuccess(res, result, 'Loan created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get loan with full schedule
   */
  static async getOne(req, res, next) {
    try {
      const result = await FlexibleLoanService.getLoanWithSchedule(
        req.params.id,
        req.user.branchId
      );
      sendSuccess(res, result, 'Loan retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record repayment
   */
  static async recordRepayment(req, res, next) {
    try {
      const result = await FlexibleLoanService.recordRepayment(
        req.body,
        req.user.id
      );
      sendSuccess(res, result, 'Repayment recorded');
    } catch (error) {
      next(error);
    }
  }
}

export default FlexibleLoanController;
