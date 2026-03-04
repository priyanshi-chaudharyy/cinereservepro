import express from 'express';
import { getAllTheaters,createTheater,getTheaterById } from '../controllers/theaterController.js';

const router=express.Router();

router.route('/')
   .get(getAllTheaters)
   .post(createTheater);

router.route('/')
   .get(getTheaterById);

export default router;
