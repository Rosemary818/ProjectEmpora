import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { getServiceHistory } from '../controllers/serviceHistory.controller';

const router = express.Router();

router.get('/', protect, restrictTo('Employee'), getServiceHistory);

export default router;
