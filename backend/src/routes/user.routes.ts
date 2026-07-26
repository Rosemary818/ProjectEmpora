import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect); // All user routes require authentication

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

export default router;
