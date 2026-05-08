import mongoose from "mongoose";

const showtimeSchema = new mongoose.Schema({
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
    screenId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    showDate: {
        type: Date
    },
    showTime: {
        type: String,  //eg "10:00 AM"
        required: true
    },
    pricing: {
        vip: Number,
        premium: Number,
        economy: Number
    },
    isDynamicPricingActive: {
        type: Boolean,
        default: false
    },
    //seat status :A1,A2,B1 etc.
    seatStatus: [{
        seatNumber: String,
        status: {
            type: String,
            enum: ['Available', 'Booked', 'Blocked'],
            default: 'Available'
        },
        seatType: {
            type: String,
            enum: ['VIP', 'Premium', 'Economy']
        },
        bookedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    blockedSeats: [String],  // for temporary 10-min locks(seat numbers)
    totalSeatAvailable: Number
},
    {
        timestamps: true
    });

export default mongoose.model('Showtime', showtimeSchema);