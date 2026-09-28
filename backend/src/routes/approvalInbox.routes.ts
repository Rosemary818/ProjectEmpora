import { Router } from 'express';
import { getApprovalInbox } from '../controllers/approvalInbox.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', restrictTo('Manager', 'HRAdmin', 'SuperAdmin'), getApprovalInbox);

export default router;
