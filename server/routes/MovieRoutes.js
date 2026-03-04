import express from 'express';
import {protect,adminOnly} from '../middleware/authMiddleware.js';
import{
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie
} from '../controllers/movieController.js';

const router=express.Router();

router.route('/')
   .get(getAllMovies)
   .post(protect,adminOnly,createMovie); //will add auth middleware later

router.route('/:id')
   .get(getMovieById)
   .put(protect,adminOnly,updateMovie)
   .delete(protect,adminOnly,deleteMovie);

   export default router;
