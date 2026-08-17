import express from 'express';
import {
  createAnnouncement,
  publishAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  archiveAnnouncement
} from '../controllers/announcement.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

// All announcement routes are protected
router.use(protect);

// Prevent Candidates from accessing internal announcements
router.use(restrictTo('SuperAdmin', 'HRAdmin', 'Manager', 'Employee'));

router
  .route('/')
  .get(getAnnouncements)
  .post(restrictTo('SuperAdmin', 'HRAdmin'), createAnnouncement);

router
  .route('/:id')
  .get(getAnnouncementById)
  .put(restrictTo('SuperAdmin', 'HRAdmin'), updateAnnouncement)
  .delete(restrictTo('SuperAdmin', 'HRAdmin'), deleteAnnouncement);

router.patch('/:id/publish', restrictTo('SuperAdmin', 'HRAdmin'), publishAnnouncement);
router.patch('/:id/archive', restrictTo('SuperAdmin', 'HRAdmin'), archiveAnnouncement);

export default router;
