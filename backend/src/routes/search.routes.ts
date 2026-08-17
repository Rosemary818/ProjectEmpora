import express from 'express';
import { globalSearch } from '../controllers/search.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// All logged in users can search, but results are filtered by role in the controller
router.get('/', protect, globalSearch);

export default router;
