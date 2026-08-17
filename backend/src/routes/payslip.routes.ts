import express from 'express';
import {
  getPayslips,
  getPayslip,
  generatePayslip,
  updatePayslipStatus,
  getPayslipsByEmployee,
} from '../controllers/payslip.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(restrictTo('HRAdmin', 'SuperAdmin'), getPayslips)
  .post(restrictTo('HRAdmin', 'SuperAdmin'), generatePayslip);

router.route('/employee/:employeeId')
  .get(getPayslipsByEmployee); // Access checked in controller (Self or Admin)

router.route('/:id')
  .get(getPayslip); // Access checked in controller (Self or Admin)

router.route('/:id/status')
  .put(restrictTo('HRAdmin', 'SuperAdmin'), updatePayslipStatus);

export default router;
