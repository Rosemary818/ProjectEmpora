import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { getRooms, getBookings, createBooking, cancelBooking, getAllRoomsAdmin, createRoom, updateRoom, updateRoomStatus, deleteRoom } from '../controllers/roomBooking.controller';

const router = express.Router();

router.use(protect);

router.get('/rooms', getRooms);
router.get('/', getBookings);
router.post('/', createBooking);
router.delete('/:id', cancelBooking);

// --- HR Admin Room Management Routes ---
router.use(restrictTo('SuperAdmin', 'HRAdmin'));

router.get('/admin/all-rooms', getAllRoomsAdmin);
router.post('/room', createRoom);
router.put('/room/:id', updateRoom);
router.patch('/room/:id/status', updateRoomStatus);
router.delete('/room/:id', deleteRoom);

export default router;
