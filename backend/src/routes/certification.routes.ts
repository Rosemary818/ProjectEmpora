import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import {
  getEmployeeCertifications,
  addCertification,
  updateCertification,
  deleteCertification,
  getAllCertifications,
  verifyCertification,
} from '../controllers/certification.controller';

const router = express.Router();

router.use(protect);

// HR Only routes
router.get('/all', restrictTo('HRAdmin', 'SuperAdmin'), getAllCertifications);
router.put('/:id/verify', restrictTo('HRAdmin', 'SuperAdmin'), verifyCertification);

// General/Employee routes
router.get('/employee', getEmployeeCertifications);
router.get('/employee/:userId', getEmployeeCertifications);
router.post('/', upload.single('certificate'), addCertification);
router.put('/:id', upload.single('certificate'), updateCertification);
router.delete('/:id', deleteCertification);

export default router;
