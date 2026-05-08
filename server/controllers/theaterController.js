import Theater from "../models/Theater.js";

export const getAllTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find({ isActive: true }).populate('ownerId', 'name businessName');

        res.json({
            success: true,
            count: theaters.length,
            data: theaters
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching theaters',
            error: error.message
        });
    }
};

export const createTheater = async (req, res) => {
    try {
        // Auto-set ownerId for theater admins
        const theaterData = { ...req.body };
        if (req.user.role === 'theater_admin') {
            theaterData.ownerId = req.user._id;
        }

        const theater = await Theater.create(theaterData);

        res.status(201).json({
            success: true,
            data: theater
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'error creating theater',
            error: error.message
        });
    }
};

// Get theaters belonging to the logged-in theater admin
export const getMyTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find({ ownerId: req.user._id, isActive: true });

        res.json({
            success: true,
            count: theaters.length,
            data: theaters
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching your theaters',
            error: error.message
        });
    }
};

export const getTheaterById = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id).populate('ownerId', 'name businessName');

        if (!theater) {
            return res.status(404).json({
                success: false,
                message: 'Theater not found'
            });
        }

        res.json({
            success: true,
            data: theater
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching theater',
            error: error.message
        });
    }
};

// @desc Update a theater
// @route PUT /api/theaters/:id
// @access Admin or theater owner
export const updateTheater = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);

        if (!theater) {
            return res.status(404).json({
                success: false,
                message: 'Theater not found'
            });
        }

        // Theater admins can only update their own theaters
        if (req.user.role === 'theater_admin' && String(theater.ownerId) !== String(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own theaters'
            });
        }

        // Don't allow theater_admin to change ownerId
        if (req.user.role === 'theater_admin') {
            delete req.body.ownerId;
        }

        const updated = await Theater.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            message: 'Theater updated successfully',
            data: updated
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating theater',
            error: error.message
        });
    }
};

// @desc Delete (deactivate) a theater
// @route DELETE /api/theaters/:id
// @access Admin or theater owner
export const deleteTheater = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);

        if (!theater) {
            return res.status(404).json({
                success: false,
                message: 'Theater not found'
            });
        }

        // Theater admins can only delete their own theaters
        if (req.user.role === 'theater_admin' && String(theater.ownerId) !== String(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own theaters'
            });
        }

        // Soft delete — just deactivate
        theater.isActive = false;
        await theater.save();

        res.json({
            success: true,
            message: `${theater.name} has been deactivated`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting theater',
            error: error.message
        });
    }
};

export const getLocations = async (req, res) => {
    try {
        const locations = await Theater.distinct('location.city', { isActive: true });
        
        res.json({
            success: true,
            data: locations.filter(Boolean)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching locations',
            error: error.message
        });
    }
};