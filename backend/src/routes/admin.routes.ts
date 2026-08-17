import { Router } from 'express';
import * as AdminController from '../controllers/admin.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Protect all admin routes
router.use(protect);

// HRAdmin & SuperAdmin routes
router.get('/hr-dashboard', restrictTo('HRAdmin', 'SuperAdmin'), AdminController.getHRAdminDashboard);
router.get('/employees', restrictTo('HRAdmin', 'SuperAdmin'), AdminController.getAllEmployees);
router.get('/employees/:id', restrictTo('HRAdmin', 'SuperAdmin'), AdminController.getUserDetails);
router.patch('/employees/:id', restrictTo('HRAdmin', 'SuperAdmin'), AdminController.updateUserProfile);
router.patch('/employees/:id/status', restrictTo('HRAdmin', 'SuperAdmin'), AdminController.updateUserStatus);

// SuperAdmin exclusively
router.get('/super-dashboard', restrictTo('SuperAdmin'), AdminController.getSuperAdminDashboard);
router.get('/users', restrictTo('SuperAdmin'), AdminController.getAllUsers);
router.patch('/users/:id/status', restrictTo('SuperAdmin'), AdminController.updateUserStatus);
router.get('/users/:id', restrictTo('SuperAdmin'), AdminController.getUserDetails);

// SuperAdmin: HR Admin Management
router.post('/hr-admins', restrictTo('SuperAdmin'), AdminController.createHRAdmin);
router.put('/hr-admins/:id', restrictTo('SuperAdmin'), AdminController.updateHRAdmin);
router.patch('/hr-admins/:id/reset-password', restrictTo('SuperAdmin'), AdminController.resetHRAdminPassword);

// SuperAdmin: Manager Management
router.get('/managers', restrictTo('SuperAdmin'), AdminController.getManagers);
router.get('/managers/:id/team', restrictTo('SuperAdmin'), AdminController.getManagerTeam);
router.post('/managers', restrictTo('SuperAdmin'), AdminController.createManager);
router.put('/managers/:id', restrictTo('SuperAdmin'), AdminController.updateManager);
router.patch('/managers/:id/reset-password', restrictTo('SuperAdmin'), AdminController.resetManagerPassword);

// SuperAdmin: Service Executive Management
router.get('/service-executives', restrictTo('SuperAdmin'), AdminController.getServiceExecutives);
router.post('/service-executives', restrictTo('SuperAdmin'), AdminController.createServiceExecutive);
router.put('/service-executives/:id', restrictTo('SuperAdmin'), AdminController.updateServiceExecutive);
router.patch('/service-executives/:id/reset-password', restrictTo('SuperAdmin'), AdminController.resetServiceExecutivePassword);
router.post('/service-executives/:id/resend-invite', restrictTo('SuperAdmin'), AdminController.resendServiceExecutiveInvite);

// SuperAdmin: Employee Management
router.get('/super-admin/employees', restrictTo('SuperAdmin'), AdminController.getSuperAdminEmployees);
router.get('/super-admin/employees/:id/profile', restrictTo('SuperAdmin'), AdminController.getSuperAdminEmployeeProfile);
router.patch('/super-admin/employees/bulk-status', restrictTo('SuperAdmin'), AdminController.bulkUpdateEmployeeStatus);

// SuperAdmin: Candidates Management
router.get('/super-admin/candidates', restrictTo('SuperAdmin'), AdminController.getSuperAdminCandidates);

export default router;
