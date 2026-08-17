import { Router } from 'express';
import * as LeaveController from '../controllers/leave.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// All leave routes require authentication
router.use(protect);

// Employee routes
router.post('/', upload.single('document'), LeaveController.applyLeave);
router.get('/', LeaveController.getMyLeaves);

// Manager / HRAdmin / SuperAdmin routes
router.get('/all', restrictTo('HRAdmin', 'Manager', 'SuperAdmin'), LeaveController.getAllLeaves);
router.put('/:id/status', restrictTo('HRAdmin', 'Manager', 'SuperAdmin'), LeaveController.updateLeaveStatus);

export default router;
