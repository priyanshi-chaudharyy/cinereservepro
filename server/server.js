import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import movieRoutes from './routes/movieRoutes.js';
import theaterRoutes from './routes/theaterRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import showtimeRoutes from './routes/showtimeRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app=express();

//middleware
app.use(helmet());
app.use(cors({
    origin:process.env.CLIENT_URL || 'http://localhost:5173',
    credentials:true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));

// Add after middleware setup in server.js
app.use('/api/auth',authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/upload',uploadRoutes);
app.use('/api/showtimes',showtimeRoutes);

//Test route
app.get('/api/health',(req,res)=>{
    res.json({status:'Server is running!'});
});

//db connection
mongoose.connect(process.env.MONGO_URI)
   .then(()=>console.log('MongoDB Connected'))
   .catch(err=>console.log('MongoDB Error:',err));

const PORT =process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});