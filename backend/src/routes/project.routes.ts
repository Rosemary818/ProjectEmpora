import { Router } from 'express';
import * as ProjectController from '../controllers/project.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

// HRAdmin & SuperAdmin routes
router.post('/', restrictTo('HRAdmin', 'SuperAdmin'), ProjectController.createProject);
router.get('/', restrictTo('HRAdmin', 'SuperAdmin'), ProjectController.getAllProjects);
router.patch('/:id', restrictTo('HRAdmin', 'SuperAdmin'), ProjectController.updateProject);

// Manager routes
router.get('/my-projects', restrictTo('Manager', 'SuperAdmin'), ProjectController.getMyProjects);
router.get('/available-employees', restrictTo('Manager', 'SuperAdmin'), ProjectController.getAvailableEmployees);
router.post('/:id/team', restrictTo('Manager', 'SuperAdmin'), ProjectController.addTeamMember);
router.delete('/:id/team/:employeeId', restrictTo('Manager', 'SuperAdmin'), ProjectController.removeTeamMember);

// Employee routes
router.get('/assigned', restrictTo('Employee', 'SuperAdmin'), ProjectController.getAssignedProjects);

export default router;
