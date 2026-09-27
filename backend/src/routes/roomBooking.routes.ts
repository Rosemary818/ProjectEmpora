import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { getRooms, getBookings, createBooking, cancelBooking, getAllRoomsAdmin, createRoom, updateRoom, updateRoomStatus, deleteRoom, getAvailableAlternatives, swapRoom, getSwappableBookings, getSwapRequests, createSwapRequest, acceptSwapRequest, rejectSwapRequest, cancelSwapRequest } from '../controllers/roomBooking.controller';

const router = express.Router();

router.use(protect);

router.get('/rooms', getRooms);
router.get('/', getBookings);
router.post('/', createBooking);
router.get('/:id/alternatives', getAvailableAlternatives);
router.post('/:id/swap', swapRoom);

// --- Room Swap Request Routes ---
router.get('/swaps/requests', getSwapRequests);
router.post('/swaps', createSwapRequest);
router.post('/swaps/:id/accept', acceptSwapRequest);
router.post('/swaps/:id/reject', rejectSwapRequest);
router.post('/swaps/:id/cancel', cancelSwapRequest);
router.get('/:id/swappable', getSwappableBookings);

router.delete('/:id', cancelBooking);

// --- HR Admin Room Management Routes ---
router.use(restrictTo('SuperAdmin', 'HRAdmin'));

router.get('/admin/all-rooms', getAllRoomsAdmin);
router.post('/room', createRoom);
router.put('/room/:id', updateRoom);
router.patch('/room/:id/status', updateRoomStatus);
router.delete('/room/:id', deleteRoom);

export default router;
