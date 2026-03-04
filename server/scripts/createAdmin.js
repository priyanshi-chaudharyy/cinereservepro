import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@cinereserve.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin'
    });

    console.log('✅ Admin created:', admin.email);
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();