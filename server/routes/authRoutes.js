import express from 'express';
import {
    signup,
    login,
    logout,
    getMe,
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { googleLogin } from '../controllers/authController.js';

const router = express.Router();

//public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);


//proteted routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;