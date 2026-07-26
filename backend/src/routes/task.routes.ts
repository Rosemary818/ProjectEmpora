import { Router } from 'express';
import * as TaskController from '../controllers/task.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// All task routes require authentication
router.use(protect);

// Employee routes
router.get('/my-tasks', TaskController.getMyTasks);
router.patch('/:id/status', TaskController.updateTaskStatus);

// Manager / Admin routes
router.post('/', restrictTo('HRAdmin', 'Manager', 'SuperAdmin'), TaskController.createTask);
router.get('/manager', restrictTo('HRAdmin', 'Manager', 'SuperAdmin'), TaskController.getManagerTasks);
router.patch('/:id', restrictTo('HRAdmin', 'Manager', 'SuperAdmin'), TaskController.updateTask);
router.delete('/:id', restrictTo('HRAdmin', 'Manager', 'SuperAdmin'), TaskController.deleteTask);

export default router;
