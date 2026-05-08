import User from '../models/User.js';

// @desc Get all pending theater admin registrations
// @route GET /api/admin/pending
// @access Admin only
export const getPendingAdmins = async (req, res) => {
    try {
        const pending = await User.find({
            role: 'theater_admin',
            isApproved: false
        }).select('-password').sort({ createdAt: -1 });

        res.json({ success: true, data: pending });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Get all approved theater admins
// @route GET /api/admin/approved
// @access Admin only
export const getApprovedAdmins = async (req, res) => {
    try {
        const approved = await User.find({
            role: 'theater_admin',
            isApproved: true
        }).select('-password').sort({ createdAt: -1 });

        res.json({ success: true, data: approved });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Approve a theater admin
// @route PUT /api/admin/approve/:userId
// @access Admin only
export const approveAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user || user.role !== 'theater_admin') {
            return res.status(404).json({ success: false, message: 'Theater admin not found' });
        }

        user.isApproved = true;
        await user.save();

        res.json({ success: true, message: `${user.businessName || user.name} has been approved!`, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Reject a theater admin (delete their account)
// @route DELETE /api/admin/reject/:userId
// @access Admin only
export const rejectAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user || user.role !== 'theater_admin') {
            return res.status(404).json({ success: false, message: 'Theater admin not found' });
        }

        await User.findByIdAndDelete(req.params.userId);

        res.json({ success: true, message: `${user.businessName || user.name} registration rejected.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
