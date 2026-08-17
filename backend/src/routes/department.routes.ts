import express from 'express';
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  updateDepartmentStatus,
  getDepartmentDetails
} from '../controllers/department.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);

// Allow all authenticated users (including Employees) to fetch departments
router.get('/', getAllDepartments);

// Restrict the following routes to HR and SuperAdmins
router.use(restrictTo('SuperAdmin', 'HRAdmin'));

router.post('/', createDepartment);

router.route('/:id')
  .get(getDepartmentDetails)
  .patch(updateDepartment);

router.patch('/:id/status', updateDepartmentStatus);

export default router;
