import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import * as referralController from '../controllers/referral.controller';

const router = express.Router();

// Protect all routes
router.use(protect);

// Employee routes
router.post('/', restrictTo('Employee'), upload.single('resume'), referralController.submitReferral);
router.get('/my', restrictTo('Employee'), referralController.getMyReferrals);

// HR Admin routes
router.get('/all', restrictTo('HRAdmin', 'SuperAdmin'), referralController.getAllReferrals);
router.patch('/:id/status', restrictTo('HRAdmin', 'SuperAdmin'), referralController.updateStatus);
router.post('/:id/convert', restrictTo('HRAdmin', 'SuperAdmin'), referralController.convertToEmployee);
router.post('/:id/resend-welcome', restrictTo('HRAdmin', 'SuperAdmin'), referralController.resendWelcomeEmail);
router.delete('/:id', restrictTo('HRAdmin', 'SuperAdmin'), referralController.deleteReferral);

export default router;
