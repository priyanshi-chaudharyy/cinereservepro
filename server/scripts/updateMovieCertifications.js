import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from '../models/Movie.js';

dotenv.config();

const certificationsByTitle = {
  'Spider-Man: Across the Spider-Verse': 'U',
  'The Matrix': 'A',
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    await Movie.updateMany({}, { $set: { certification: 'UA' } });

    const ops = Object.entries(certificationsByTitle).map(([title, certification]) => ({
      updateOne: {
        filter: { title },
        update: { $set: { certification } }
      }
    }));

    if (ops.length === 0) {
      console.log('No updates. Add title -> certification entries first.');
      process.exit(0);
    }

    const result = await Movie.bulkWrite(ops);
    console.log('✅ Updated certifications:', result.modifiedCount || 0);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

run();
