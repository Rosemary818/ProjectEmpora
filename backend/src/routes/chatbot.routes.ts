import { Router } from 'express';
import { chatWithBot } from '../controllers/chatbot.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Protect the chat endpoint to only authenticated users
router.use(protect);
// Restrict to Employees and Managers as per requirement
router.use(restrictTo('Employee', 'Manager'));

router.post('/', chatWithBot);

export default router;
