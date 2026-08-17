import express from 'express';
import {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} from '../controllers/policy.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router
  .route('/')
  .get(getPolicies)
  .post(restrictTo('HRAdmin', 'SuperAdmin'), createPolicy);

router
  .route('/:id')
  .get(getPolicyById)
  .put(restrictTo('HRAdmin', 'SuperAdmin'), updatePolicy)
  .delete(restrictTo('HRAdmin', 'SuperAdmin'), deletePolicy);

export default router;
