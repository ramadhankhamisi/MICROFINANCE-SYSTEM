import { body, query as queryValidator } from 'express-validator';
import FlexibleLoanCalculationService from '../services/flexibleLoanCalculationService.js';

export const validateCreateLoan = [
  body('customer_id')
    .isInt({ min: 1 })
    .withMessage('Valid customer ID required'),
  body('principal_amount')
    .isDecimal({ decimal_digits: '1,2' })
    .custom(value => {
      const amount = parseFloat(value);
      if (amount < 10000) throw new Error('Minimum loan amount is 10,000 TSH');
      if (amount > 10000000) throw new Error('Maximum loan amount is 10,000,000 TSH');
      return true;
    })
    .withMessage('Loan amount must be between 10,000 and 10,000,000'),
  body('repayment_days')
    .isInt({ min: 1, max: 365 })
    .withMessage('Repayment days must be between 1 and 365')
    .custom((value, { req }) => {
      const validation = FlexibleLoanCalculationService.validateRepaymentDays(
        req.body.principal_amount,
        value
      );
      if (!validation.isValid) {
        throw new Error(validation.message);
      }
      return true;
    })
    .withMessage('Invalid repayment days'),
];

export const validateRepaymentDaysInput = [
  queryValidator('amount')
    .isDecimal()
    .withMessage('Amount required'),
  queryValidator('days')
    .isInt({ min: 1 })
    .withMessage('Days must be positive integer'),
];
