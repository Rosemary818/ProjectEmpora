import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  assignAsset,
  returnAsset,
  transferAsset,
  maintainAsset,
  retireAsset,
  getAssetHistory,
  getMyAssets,
  getTeamAssets,
  getAssetStats
} from '../controllers/asset.controller';

const router = express.Router();

router.use(protect);

// Employee routes
router.get('/me', getMyAssets);

// Manager routes
router.get('/team', restrictTo('Manager', 'SuperAdmin', 'HRAdmin'), getTeamAssets);

// HR Admin and Super Admin routes
router.use(restrictTo('HRAdmin', 'SuperAdmin'));

router.get('/stats', getAssetStats);
router.route('/')
  .get(getAllAssets)
  .post(createAsset);

router.route('/:id')
  .get(getAssetById)
  .put(updateAsset);

router.post('/:id/assign', assignAsset);
router.post('/:id/return', returnAsset);
router.post('/:id/transfer', transferAsset);
router.post('/:id/maintenance', maintainAsset);
router.post('/:id/retire', retireAsset);
router.get('/:id/history', getAssetHistory);

export default router;
