import express from 'express';
import {
    createShowtime,
    getAllShowtimes,
    getShowtimeById,
    deleteShowtime
} from '../controllers/showtimeController.js';
import { protect, theaterAdminOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
   .get(getAllShowtimes)
   .post(protect, theaterAdminOrAdmin, createShowtime);

router.route('/:id')
  .get(getShowtimeById)
  .delete(protect, theaterAdminOrAdmin, deleteShowtime);

export default router;