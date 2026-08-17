import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument,
} from '../controllers/document.controller';

const router = express.Router();

// All document routes require authentication
router.use(protect);

// Candidates are completely blocked from document routes
router.use(restrictTo('SuperAdmin', 'HRAdmin', 'Manager', 'Employee'));

router
  .route('/')
  .post(upload.single('file'), uploadDocument)
  .get(getDocuments);

router
  .route('/:id')
  .get(getDocumentById)
  .delete(deleteDocument);

router
  .route('/:id/download')
  .get(downloadDocument);

export default router;
