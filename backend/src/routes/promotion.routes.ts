import { Router } from 'express';
import {
  createPromotionProposal,
  getManagerPromotions,
  getAllPromotions,
  getEmployeePromotions,
  updatePromotionStatus,
  cancelPromotion
} from '../controllers/promotion.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

// Employee routes
router.get('/my-promotions', getEmployeePromotions);

// Manager routes
router.post('/proposal', restrictTo('Manager', 'HRAdmin', 'SuperAdmin'), createPromotionProposal);
router.get('/team', restrictTo('Manager'), getManagerPromotions);
router.patch('/:id/cancel', restrictTo('Manager', 'HRAdmin', 'SuperAdmin'), cancelPromotion);

// HR Admin routes
router.get('/', restrictTo('HRAdmin', 'SuperAdmin'), getAllPromotions);
router.patch('/:id/status', restrictTo('HRAdmin', 'SuperAdmin'), updatePromotionStatus);

export default router;
