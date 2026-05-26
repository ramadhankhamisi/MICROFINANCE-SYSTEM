import express from 'express';
import { FlexibleLoanController } from '../controllers/flexibleLoanController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { handleValidationErrors } from '../middleware/validationMiddleware.js';
import { validateCreateLoan, validateRepaymentDaysInput } from '../validators/loanValidator.js';

const router = express.Router();

// Public calculation endpoint (no auth for frontend preview)
router.get('/calculation-preview', FlexibleLoanController.getCalculationPreview);
router.get('/repayment-range', FlexibleLoanController.getRepaymentRange);

// Protected loan endpoints
router.use(authenticate);

router.post(
  '/',
  authorize('loan_officer', 'branch_manager', 'admin'),
  validateCreateLoan,
  handleValidationErrors,
  FlexibleLoanController.create
);

router.get('/:id', FlexibleLoanController.getOne);

router.post(
  '/:id/repayment',
  authorize('cashier', 'branch_manager', 'admin'),
  FlexibleLoanController.recordRepayment
);

export default router;
