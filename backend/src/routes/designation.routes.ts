import express from 'express';
import {
  createDesignation,
  getAllDesignations,
  getDesignationById,
  updateDesignation,
  toggleDesignationStatus
} from '../controllers/designation.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);
router.use(restrictTo('HRAdmin', 'SuperAdmin'));

router.route('/')
  .post(createDesignation)
  .get(getAllDesignations);

router.route('/:id')
  .get(getDesignationById)
  .patch(updateDesignation);

router.route('/:id/status')
  .patch(toggleDesignationStatus);

export default router;
