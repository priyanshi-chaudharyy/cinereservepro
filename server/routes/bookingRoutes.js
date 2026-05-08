import express from 'express';
import { getMyBookings, getBookingById, cancelBooking, checkInBooking } from '../controllers/bookingController.js';
import { protect, staffAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/checkin', protect, staffAccess, checkInBooking);

export default router;
