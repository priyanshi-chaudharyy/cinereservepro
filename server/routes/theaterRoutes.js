import express from 'express';
import { getAllTheaters, createTheater, getTheaterById, getMyTheaters, updateTheater, deleteTheater, getLocations } from '../controllers/theaterController.js';
import { protect, theaterAdminOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
   .get(getAllTheaters)
   .post(protect, theaterAdminOrAdmin, createTheater);

router.get('/my-theaters', protect, theaterAdminOrAdmin, getMyTheaters);

router.get('/locations', getLocations);

router.route('/:id')
   .get(getTheaterById)
   .put(protect, theaterAdminOrAdmin, updateTheater)
   .delete(protect, theaterAdminOrAdmin, deleteTheater);

export default router;
