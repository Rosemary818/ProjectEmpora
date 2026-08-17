import express from 'express';
import {
  createOpportunity,
  getOpportunitiesHR,
  updateOpportunity,
  deleteOpportunity,
  getOpportunityApplicants,
  updateApplicationStatus,
  confirmInternalTransfer,
  getPublishedOpportunities,
  applyForOpportunity,
  getMyApplications,
  withdrawApplication,
  getTeamApplications,
  recommendApplication,
  scheduleInternalInterview,
  getAllApplicationsHR
} from '../controllers/internalMobility.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);

// Employee Routes
router.get('/opportunities', getPublishedOpportunities);
router.post('/apply', applyForOpportunity);
router.get('/my-applications', getMyApplications);
router.put('/my-applications/:id/withdraw', withdrawApplication);

// Manager Routes
router.get('/manager/team-applications', restrictTo('Manager', 'SuperAdmin', 'HRAdmin'), getTeamApplications);
router.put('/manager/applications/:id/recommend', restrictTo('Manager', 'SuperAdmin', 'HRAdmin'), recommendApplication);

// HR Admin Routes
router.use(restrictTo('HRAdmin', 'SuperAdmin'));
router.post('/hr/opportunities', createOpportunity);
router.get('/hr/opportunities', getOpportunitiesHR);
router.put('/hr/opportunities/:id', updateOpportunity);
router.delete('/hr/opportunities/:id', deleteOpportunity);
router.get('/hr/opportunities/:id/applicants', getOpportunityApplicants);
router.get('/hr/applications', getAllApplicationsHR);
router.put('/hr/applications/:id/status', updateApplicationStatus);
router.post('/hr/applications/:id/interview', scheduleInternalInterview);
router.post('/hr/applications/:id/confirm-transfer', confirmInternalTransfer);

export default router;
