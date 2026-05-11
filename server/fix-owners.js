import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Theater from './models/Theater.js';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to DB');
    const partner = await User.findOne({ email: 'partner@pvr.com' });
    if (partner) {
        // Find theaters that have 'PVR' in name
        const res = await Theater.updateMany({ name: { $regex: /PVR/i } }, { ownerId: partner._id });
        console.log('Updated theaters for PVR partner:', res.modifiedCount);
    }
    process.exit(0);
});
