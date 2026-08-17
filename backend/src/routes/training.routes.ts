import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import * as TrainingController from '../controllers/training.controller';

const router = Router();

router.use(protect);

// Employee & Manager routes
router.get('/available', TrainingController.getAvailableTrainings);
router.post('/:id/enroll', TrainingController.enrollTraining);
router.patch('/enrollments/:id/status', TrainingController.updateEnrollmentStatus);
router.get('/my-enrollments', TrainingController.getMyTrainings);

// Manager specific
router.get('/team-enrollments', restrictTo('Manager'), TrainingController.getTeamTrainings);

// HR Admin routes
router.post('/', restrictTo('HRAdmin', 'SuperAdmin'), TrainingController.createTraining);
router.put('/:id', restrictTo('HRAdmin', 'SuperAdmin'), TrainingController.updateTraining);
router.get('/:id/enrollments', restrictTo('HRAdmin', 'SuperAdmin'), TrainingController.getTrainingEnrollments);
router.get('/', restrictTo('HRAdmin', 'SuperAdmin'), TrainingController.getAllTrainings);

export default router;
