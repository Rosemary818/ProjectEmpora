import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../controllers/notification.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

// All notification routes are protected
router.use(protect);

// Allow employees, managers, admins
router.use(restrictTo('SuperAdmin', 'HRAdmin', 'Manager', 'Employee'));

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/mark-all-read', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
