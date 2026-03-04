import express from 'express';
import {
    createShowtime,
    getAllShowtimes,
    getShowtimeById,
    deleteShowtime
} from '../controllers/showtimeController.js';
import {protect,adminOnly} from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
   .get(getAllShowtimes)
   .post(protect,adminOnly,createShowtime);

router.route('/:id')
  .get(getShowtimeById)
  .delete(protect,adminOnly,deleteShowtime);

export default router;