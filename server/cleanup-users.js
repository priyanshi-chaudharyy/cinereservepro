import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Theater from './models/Theater.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        
        const originalUser = await User.findOne({ email: 'pvr@test.com' });
        const myScriptUser = await User.findOne({ email: 'pvr@cinema.com' });
        
        if (originalUser && myScriptUser) {
            // Re-assign my script's theater to the original user
            const myScriptTheaters = await Theater.find({ ownerId: myScriptUser._id });
            for (const t of myScriptTheaters) {
                t.ownerId = originalUser._id;
                await t.save();
                console.log(`Transferred theater ${t.name} to original user`);
            }
            
            // Delete my script's user
            await User.findByIdAndDelete(myScriptUser._id);
            console.log('Deleted duplicate PVR user: pvr@cinema.com');
        } else {
            console.log('Duplicate not found as expected');
        }
        
        console.log('Cleanup complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
