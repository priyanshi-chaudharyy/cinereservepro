import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    showtimeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Showtime',
        required: true
    },
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    theaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater',
        required: true
    },
    seats: [{
        type: String,
        required: true
    }],
    seatType: {
        type: String,
        enum: ['VIP', 'Premium', 'Economy'],
        default: 'Economy'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
        type: String,
        enum: ['Confirmed', 'Cancelled'],
        default: 'Confirmed'
    },
    refundStatus: {
        type: String,
        enum: ['N/A', 'Pending', 'Processed', 'Failed'],
        default: 'N/A'
    },
    isCheckedIn: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('Booking', bookingSchema);
