import express from 'express';
import { submitFeedback, getFeedbackForRequest, getServiceExecutiveFeedback } from '../controllers/feedback.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/', submitFeedback);
router.get('/service-executive', restrictTo('ServiceExecutive'), getServiceExecutiveFeedback);
router.get('/:requestType/:requestId', getFeedbackForRequest);

export default router;
