import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('admin', 'branch_manager', 'loan_officer'), (req, res) => {
  res.json({ message: 'Create loan - ready for implementation' });
});

router.get('/', (req, res) => {
  res.json({ message: 'List loans - ready for implementation' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get loan details - ready for implementation' });
});

router.put('/:id', authorize('admin', 'branch_manager'), (req, res) => {
  res.json({ message: 'Update loan - ready for implementation' });
});

export default router;
