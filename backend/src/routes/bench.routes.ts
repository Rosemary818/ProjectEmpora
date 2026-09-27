import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import {
  getBenchEmployees,
  getBenchDashboardStats,
  updateBenchStatus,
  getMyBenchStatus,
  getRecommendedProjects,
  getRecommendedOpportunities,
  applyForProject,
  getManagerTeamBench,
  getAvailableBenchEmployees,
  requestAllocation,
  getProjectApplications
} from '../controllers/bench.controller';

const router = express.Router();

router.use(protect);

// HR Admin routes
router.get('/dashboard', restrictTo('SuperAdmin', 'HRAdmin'), getBenchDashboardStats);
router.get('/employees', restrictTo('SuperAdmin', 'HRAdmin', 'Manager'), getBenchEmployees);
router.put('/status/:id', restrictTo('SuperAdmin', 'HRAdmin', 'Manager'), updateBenchStatus);

// Employee routes
router.get('/my-status', restrictTo('Employee'), getMyBenchStatus);
router.get('/recommended-projects', restrictTo('Employee'), getRecommendedProjects);
router.get('/recommended-opportunities', restrictTo('Employee'), getRecommendedOpportunities);
router.post('/apply', restrictTo('Employee'), applyForProject);

// Manager routes
router.get('/my-team', restrictTo('Manager', 'SuperAdmin', 'HRAdmin'), getManagerTeamBench);
router.get('/available', restrictTo('Manager', 'SuperAdmin', 'HRAdmin'), getAvailableBenchEmployees);
router.post('/request-allocation', restrictTo('Manager', 'SuperAdmin', 'HRAdmin'), requestAllocation);
router.get('/applications', restrictTo('Manager', 'SuperAdmin', 'HRAdmin'), getProjectApplications);

export default router;
