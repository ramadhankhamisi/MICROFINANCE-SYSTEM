import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/profit-loss', authorize('admin', 'branch_manager'), (req, res) => {
  res.json({ message: 'Profit and Loss report - ready for implementation' });
});

router.get('/portfolio', authorize('admin', 'branch_manager'), (req, res) => {
  res.json({ message: 'Portfolio report - ready for implementation' });
});

router.get('/transactions', authorize('admin', 'branch_manager'), (req, res) => {
  res.json({ message: 'Transactions report - ready for implementation' });
});

export default router;
