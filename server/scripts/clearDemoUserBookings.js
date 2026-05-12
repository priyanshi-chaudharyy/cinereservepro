import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

const email = process.argv[2] || 'user@demo';

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User not found for email: ${email}`);
            return;
        }

        const result = await Booking.deleteMany({ userId: user._id });
        user.bookingHistory = [];
        await user.save();

        console.log(`Cleared ${result.deletedCount} bookings for ${email}`);
    } catch (err) {
        console.error('Failed to clear demo bookings:', err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

run();
