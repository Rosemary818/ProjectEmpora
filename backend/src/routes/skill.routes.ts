import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import {
  getAllSkills,
  addSkill,
  getEmployeeSkills,
  addEmployeeSkill,
  updateEmployeeSkill,
  deleteEmployeeSkill,
  getAllEmployeeSkills
} from '../controllers/skill.controller';

const router = express.Router();

router.use(protect);

// HR Only route
router.get('/all-employee-skills', restrictTo('HRAdmin', 'SuperAdmin'), getAllEmployeeSkills);

router.get('/', getAllSkills);
router.post('/', addSkill);

// Note: /employee routes are for the current logged-in employee by default.
// Managers/HR can pass a userId parameter.
router.get('/employee', getEmployeeSkills);
router.get('/employee/:userId', getEmployeeSkills);
router.post('/employee', addEmployeeSkill);
router.put('/employee/:id', updateEmployeeSkill);
router.delete('/employee/:id', deleteEmployeeSkill);

export default router;
