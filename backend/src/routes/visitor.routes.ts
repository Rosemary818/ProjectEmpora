import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { checkInVisitor, checkOutVisitor, getHRVisitors } from '../controllers/visitor.controller';

const router = express.Router();

router.use(protect);

// Host actions
router.patch('/:id/check-in', checkInVisitor);
router.patch('/:id/check-out', checkOutVisitor);

// HR Admin monitoring
router.get('/hr', restrictTo('SuperAdmin', 'HRAdmin'), getHRVisitors);

export default router;
