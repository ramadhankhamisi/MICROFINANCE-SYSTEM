import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('admin', 'branch_manager', 'cashier'), (req, res) => {
  res.json({ message: 'Record repayment - ready for implementation' });
});

router.get('/', (req, res) => {
  res.json({ message: 'List repayments - ready for implementation' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get repayment details - ready for implementation' });
});

export default router;
