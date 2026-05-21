import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/summary', (req, res) => {
  res.json({ message: 'Dashboard summary - ready for implementation' });
});

router.get('/metrics', (req, res) => {
  res.json({ message: 'Dashboard metrics - ready for implementation' });
});

router.get('/charts', (req, res) => {
  res.json({ message: 'Dashboard charts - ready for implementation' });
});

export default router;
