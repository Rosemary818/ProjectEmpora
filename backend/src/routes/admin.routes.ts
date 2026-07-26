import { Router } from 'express';
import * as AdminController from '../controllers/admin.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Protect all admin routes
router.use(protect);

// HRAdmin & SuperAdmin routes
router.get('/employees', restrictTo('HRAdmin', 'SuperAdmin'), AdminController.getAllEmployees);
router.get('/employees/:id', restrictTo('HRAdmin', 'SuperAdmin'), AdminController.getUserDetails);
router.patch('/employees/:id', restrictTo('HRAdmin', 'SuperAdmin'), AdminController.updateUserProfile);
router.patch('/employees/:id/status', restrictTo('HRAdmin', 'SuperAdmin'), AdminController.updateUserStatus);

// SuperAdmin exclusively
router.get('/users', restrictTo('SuperAdmin'), AdminController.getAllUsers);
router.patch('/users/:id/status', restrictTo('SuperAdmin'), AdminController.updateUserStatus);
router.get('/users/:id', restrictTo('SuperAdmin'), AdminController.getUserDetails);

export default router;
