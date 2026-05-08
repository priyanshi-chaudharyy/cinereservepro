import Booking from '../models/Booking.js';

// @desc    Get all bookings for the logged-in user
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate('movieId', 'title posterUrl genre duration')
            .populate('theaterId', 'name location')
            .populate('showtimeId', 'showTime pricing')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching bookings', error: error.message });
    }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('movieId', 'title posterUrl genre duration language')
            .populate('theaterId', 'name location')
            .populate('showtimeId', 'showTime pricing');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Only allow the owner to see their booking
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching booking', error: error.message });
    }
};

// @desc    Cancel booking and initiate refund
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
        }

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
        }

        // Update booking status
        booking.status = 'Cancelled';
        booking.refundStatus = 'Pending';
        await booking.save();

        // Release seats
        const { default: Showtime } = await import('../models/Showtime.js');
        const showtime = await Showtime.findById(booking.showtimeId);
        if (showtime) {
            showtime.seatStatus.forEach(seat => {
                if (booking.seats.includes(seat.seatNumber)) {
                    seat.status = 'Available';
                }
            });
            await showtime.save();
        }

        // Simulate a payment gateway processing the refund after 5 seconds
        setTimeout(async () => {
            try {
                const b = await Booking.findById(booking._id);
                if (b && b.refundStatus === 'Pending') {
                    b.refundStatus = 'Processed';
                    await b.save();
                    console.log(`Simulated refund processed for booking ${b._id}`);
                }
            } catch (err) {
                console.error('Failed to simulate refund', err);
            }
        }, 5000);

        res.json({ success: true, message: 'Booking cancelled. Refund is pending.', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error cancelling booking', error: error.message });
    }
};

// @desc    Check-in a booking via QR scan
// @route   PUT /api/bookings/:id/checkin
// @access  Private (Admin/Partner)
export const checkInBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('movieId', 'title')
            .populate('showtimeId', 'showTime showDate');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found in database.' });
        }

        // Must be Confirmed
        if (booking.status !== 'Confirmed') {
            return res.status(400).json({ success: false, message: `Cannot check-in. Booking status is ${booking.status}.` });
        }

        // Prevent double entry
        if (booking.isCheckedIn) {
            return res.status(400).json({ success: false, message: 'WARNING: Ticket has already been scanned and checked in!' });
        }

        // Mark as checked in
        booking.isCheckedIn = true;
        await booking.save();

        res.json({
            success: true,
            message: 'Ticket verified and checked in successfully.',
            data: {
                movie: booking.movieId.title,
                seats: booking.seats,
                time: booking.showtimeId.showTime,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during check-in', error: error.message });
    }
};
