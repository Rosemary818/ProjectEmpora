import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import {
  createGoal,
  getManagerGoals,
  getEmployeeGoals,
  updateGoalProgress,
  updateGoalManager
} from '../controllers/goal.controller';

const router = express.Router();

router.use(protect);

// Employee routes
router.get('/employee', restrictTo('Employee', 'Manager'), getEmployeeGoals);
router.patch('/employee/:id/progress', restrictTo('Employee', 'Manager'), updateGoalProgress);

// Manager routes
router.post('/manager', restrictTo('Manager', 'HRAdmin', 'SuperAdmin'), createGoal);
router.get('/manager', restrictTo('Manager', 'HRAdmin', 'SuperAdmin'), getManagerGoals);
router.patch('/manager/:id', restrictTo('Manager', 'HRAdmin', 'SuperAdmin'), updateGoalManager);

export default router;
