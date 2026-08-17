import express from 'express';
import {
  createEvent,
  publishEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  cancelEvent,
  postponeEvent,
  inviteToEvent
} from '../controllers/event.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

// All event routes are protected
router.use(protect);

// Prevent Candidates from accessing internal events
router.use(restrictTo('SuperAdmin', 'HRAdmin', 'Manager', 'Employee'));

router
  .route('/')
  .get(getEvents)
  .post(restrictTo('SuperAdmin', 'HRAdmin'), createEvent);

router
  .route('/:id')
  .get(getEventById)
  .put(restrictTo('SuperAdmin', 'HRAdmin'), updateEvent)
  .delete(restrictTo('SuperAdmin', 'HRAdmin'), deleteEvent);

router.patch('/:id/publish', restrictTo('SuperAdmin', 'HRAdmin'), publishEvent);
router.post('/:id/invite', restrictTo('SuperAdmin', 'HRAdmin'), inviteToEvent);

router
  .route('/:id/cancel')
  .put(restrictTo('SuperAdmin', 'HRAdmin', 'Manager'), cancelEvent);

router
  .route('/:id/postpone')
  .put(restrictTo('SuperAdmin', 'HRAdmin', 'Manager'), postponeEvent);

export default router;
