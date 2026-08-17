import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  getTeamComplaints,
  employeeUpdateComplaint,
} from '../controllers/complaint.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('Employee', 'Manager'), createComplaint);
router.get('/my-complaints', restrictTo('Employee', 'Manager'), getMyComplaints);
router.get('/team', restrictTo('Manager'), getTeamComplaints);
router.patch('/:id/employee', restrictTo('Employee', 'Manager'), employeeUpdateComplaint);

router.get('/', restrictTo('SuperAdmin', 'ServiceExecutive'), getAllComplaints);
router.patch('/:id', restrictTo('SuperAdmin', 'ServiceExecutive'), updateComplaintStatus);

export default router;
