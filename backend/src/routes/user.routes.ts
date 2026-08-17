import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect); // All user routes require authentication

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.get('/my-team', restrictTo('Manager', 'SuperAdmin'), UserController.getMyTeam);
router.get('/manager-dashboard', restrictTo('Manager'), UserController.getManagerDashboard);
router.get('/team-availability', restrictTo('Manager', 'SuperAdmin'), UserController.getTeamAvailability);
router.get('/employee-dashboard', restrictTo('Employee'), UserController.getEmployeeDashboard);
router.get('/managers', restrictTo('HRAdmin', 'SuperAdmin'), UserController.getManagers);

export default router;
