import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { query } from '../config/database.js';

const router = express.Router();
router.use(authenticate);

router.get('/summary', async (req, res, next) => {
  try {
    const branchId = req.user.branchId;
    const [customers, loans, repayments] = await Promise.all([
      query('SELECT COUNT(*)::int AS total FROM customers WHERE branch_id = $1 AND status = $2', [branchId, 'active']),
      query(
        `SELECT
          COUNT(*)::int AS total_loans,
          COUNT(*) FILTER (WHERE status = 'active')::int AS active_loans,
          COALESCE(SUM(principal_amount), 0)::numeric AS total_principal,
          COALESCE(SUM(amount_outstanding), 0)::numeric AS outstanding,
          COALESCE(SUM(amount_paid), 0)::numeric AS collected
         FROM loans
         WHERE branch_id = $1`,
        [branchId]
      ),
      query(
        `SELECT COALESCE(SUM(r.amount), 0)::numeric AS today_collections
         FROM repayments r
         JOIN loans l ON l.id = r.loan_id
         WHERE l.branch_id = $1 AND r.transaction_date = CURRENT_DATE`,
        [branchId]
      ),
    ]);

    res.json({
      success: true,
      message: 'Dashboard summary retrieved',
      data: {
        totalCustomers: customers.rows[0].total,
        totalLoans: loans.rows[0].total_loans,
        activeLoans: loans.rows[0].active_loans,
        totalPrincipal: Number(loans.rows[0].total_principal),
        outstandingPortfolio: Number(loans.rows[0].outstanding),
        totalCollected: Number(loans.rows[0].collected),
        todayCollections: Number(repayments.rows[0].today_collections),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/metrics', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT status, COUNT(*)::int AS count
       FROM loans
       WHERE branch_id = $1
       GROUP BY status
       ORDER BY status`,
      [req.user.branchId]
    );

    res.json({
      success: true,
      message: 'Dashboard metrics retrieved',
      data: result.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/charts', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT transaction_date, SUM(amount)::numeric AS amount
       FROM repayments r
       JOIN loans l ON l.id = r.loan_id
       WHERE l.branch_id = $1
       GROUP BY transaction_date
       ORDER BY transaction_date DESC
       LIMIT 14`,
      [req.user.branchId]
    );

    res.json({
      success: true,
      message: 'Dashboard charts retrieved',
      data: result.rows.reverse(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
