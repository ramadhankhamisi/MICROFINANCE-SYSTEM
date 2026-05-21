import express from 'express';
import { CustomerController } from '../controllers/customerController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('admin', 'branch_manager', 'staff'), CustomerController.create);
router.get('/', CustomerController.getAll);
router.get('/:id', CustomerController.getOne);
router.put('/:id', authorize('admin', 'branch_manager', 'staff'), CustomerController.update);
router.delete('/:id', authorize('admin', 'branch_manager'), CustomerController.delete);

export default router;
