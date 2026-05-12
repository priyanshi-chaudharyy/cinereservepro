import express from 'express';
import {
	getPendingAdmins,
	getApprovedAdmins,
	approveAdmin,
	rejectAdmin,
	getPendingStaff,
	getApprovedStaff,
	approveStaff,
	rejectStaff
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require super admin
router.get('/pending', protect, adminOnly, getPendingAdmins);
router.get('/approved', protect, adminOnly, getApprovedAdmins);
router.put('/approve/:userId', protect, adminOnly, approveAdmin);
router.delete('/reject/:userId', protect, adminOnly, rejectAdmin);

// Staff approvals
router.get('/staff/pending', protect, adminOnly, getPendingStaff);
router.get('/staff/approved', protect, adminOnly, getApprovedStaff);
router.put('/staff/approve/:userId', protect, adminOnly, approveStaff);
router.delete('/staff/reject/:userId', protect, adminOnly, rejectStaff);

export default router;
