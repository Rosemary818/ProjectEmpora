import express from 'express';
import {
  getSalaries,
  getSalaryByEmployee,
  getSalaryHistory,
  createSalary,
} from '../controllers/salary.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(restrictTo('HRAdmin', 'SuperAdmin'), getSalaries)
  .post(restrictTo('HRAdmin', 'SuperAdmin'), createSalary);

router.route('/:employeeId')
  .get(getSalaryByEmployee); // Access checked in controller (Self or Admin)

router.route('/:employeeId/history')
  .get(restrictTo('HRAdmin', 'SuperAdmin'), getSalaryHistory);

export default router;
