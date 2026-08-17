import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { 
  createRequest, 
  getMyRequests, 
  getTeamRequests, 
  getHRMonitoring, 
  getHRApprovals, 
  processApproval, 
  cancelRequest 
} from '../controllers/travelRequest.controller';

const router = express.Router();

router.use(protect);

// Employee & Manager (Self)
router.post('/', createRequest);
router.get('/my', getMyRequests);
router.patch('/:id/cancel', cancelRequest);

// Manager specific
router.get('/team', restrictTo('Manager', 'HRAdmin', 'SuperAdmin'), getTeamRequests);
router.patch('/:id/process', restrictTo('Manager', 'HRAdmin', 'SuperAdmin'), processApproval);

// HR Admin specific
router.get('/hr/monitoring', restrictTo('HRAdmin', 'SuperAdmin'), getHRMonitoring);
router.get('/hr/approvals', restrictTo('HRAdmin', 'SuperAdmin'), getHRApprovals);

export default router;
