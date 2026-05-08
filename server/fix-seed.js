import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Theater from './models/Theater.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        
        const pvrTheater = await Theater.findOne({ name: 'PVR IMAX: Phoenix Palladium' });
        const inoxTheater = await Theater.findOne({ name: 'INOX: Select Citywalk' });

        if (!pvrTheater && !inoxTheater) {
            console.log('No theaters found to update.');
            process.exit(0);
        }

        // Create Users
        const passwordHash = await bcrypt.hash('password123', 12);

        let pvrUser = await User.findOne({ email: 'pvr@cinema.com' });
        if (!pvrUser) {
            pvrUser = await User.create({
                name: 'PVR Manager',
                email: 'pvr@cinema.com',
                password: 'password123', // Model pre-save hook will hash it if we don't pass hashed, but since we are seeding, let's let mongoose handle it
                phone: '9876543210',
                role: 'theater_admin',
                isApproved: true,
                businessName: 'PVR Cinemas'
            });
            console.log('Created PVR User');
        }

        let inoxUser = await User.findOne({ email: 'inox@cinema.com' });
        if (!inoxUser) {
            inoxUser = await User.create({
                name: 'INOX Manager',
                email: 'inox@cinema.com',
                password: 'password123',
                phone: '9876543211',
                role: 'theater_admin',
                isApproved: true,
                businessName: 'INOX Movies'
            });
            console.log('Created INOX User');
        }

        // Update theaters with ownerId
        if (pvrTheater) {
            pvrTheater.ownerId = pvrUser._id;
            await pvrTheater.save();
            console.log('Linked PVR theater to user');
        }

        if (inoxTheater) {
            inoxTheater.ownerId = inoxUser._id;
            await inoxTheater.save();
            console.log('Linked INOX theater to user');
        }

        console.log('Update complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
