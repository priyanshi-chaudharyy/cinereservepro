import express from 'express';
import {
    signup,
    login,
    logout,
    getMe,
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import {protect} from '../middleware/authMiddleware.js';

const router=express.Router();

//public routes
router.post('/signup',signup);
router.post('/login',login);


//proteted routes
router.post('/logout',protect,logout);
router.get('/me',protect,getMe);
router.put('/profile',protect,updateProfile);
router.put('/change-password',protect,changePassword);

export default router;