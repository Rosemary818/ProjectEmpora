import express from 'express';
import {
  createServiceRequest,
  getMyServiceRequests,
  getAllServiceRequests,
  updateServiceRequestStatus,
  getTeamServiceRequests,
  employeeUpdateServiceRequest,
} from '../controllers/serviceRequest.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('Employee', 'Manager'), createServiceRequest);
router.get('/my-requests', restrictTo('Employee', 'Manager'), getMyServiceRequests);
router.get('/team', restrictTo('Manager'), getTeamServiceRequests);
router.patch('/:id/employee', restrictTo('Employee', 'Manager'), employeeUpdateServiceRequest);

router.get('/', restrictTo('SuperAdmin', 'ServiceExecutive'), getAllServiceRequests);
router.patch('/:id', restrictTo('SuperAdmin', 'ServiceExecutive'), updateServiceRequestStatus);

export default router;
