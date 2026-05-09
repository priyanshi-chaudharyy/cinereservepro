import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import movieRoutes from './routes/MovieRoutes.js';
import theaterRoutes from './routes/theaterRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import showtimeRoutes from './routes/showtimeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import http from 'http';
import { initSockets } from './socket.js';

const app = express();

const allowedOrigins = (process.env.CLIENT_URLS || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

//middleware
app.use(helmet());
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ⚠️ CRITICAL: Razorpay Webhook route MUST be mounted BEFORE express.json()
// because express.json() consumes the raw body, breaking crypto signature validation.
import { razorpayWebhook } from './controllers/paymentController.js';
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Add after middleware setup in server.js
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

//Test route
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running!' });
});

//db connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Error:', err));

const PORT = process.env.PORT || 5000;

// Wrap express with HTTP server
const httpServer = http.createServer(app);
// Initialize Sockets & Redis (non-blocking — server starts regardless)
initSockets(httpServer).catch(err => console.log('Socket init warning:', err.message));
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});