import express from 'express';
import { getPendingAdmins, getApprovedAdmins, approveAdmin, rejectAdmin } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require super admin
router.get('/pending', protect, adminOnly, getPendingAdmins);
router.get('/approved', protect, adminOnly, getApprovedAdmins);
router.put('/approve/:userId', protect, adminOnly, approveAdmin);
router.delete('/reject/:userId', protect, adminOnly, rejectAdmin);

export default router;
