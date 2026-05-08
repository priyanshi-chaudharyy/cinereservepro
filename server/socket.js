import { Server } from 'socket.io';
import { createClient } from 'redis';

let io;
let redisClient;
let redisAvailable = false;

const socketOrigins = (process.env.SOCKET_ORIGIN || process.env.CLIENT_URLS || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

export const initSockets = async (server) => {
    //1.init socket.io
    io = new Server(server, {
        cors: {
            origin: socketOrigins,
            methods: ["GET", "POST"]
        }
    });

    //2.init Redis client (optional — app works without it, just no seat locking)
    try {
        redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            socket: { connectTimeout: 3000 }  // Fail fast if Redis isn't running
        });
        redisClient.on('error', () => {}); // Suppress repeated error logs
        await redisClient.connect();
        redisAvailable = true;
        console.log('✅ Redis connected — real-time seat locking enabled');

        //enable keyspace notifications in Redis (so we know when a lock expires)
        await redisClient.configSet('notify-keyspace-events', 'Ex');

        //create a subscriber client precisely to listen for expired keys
        const subscriber = redisClient.duplicate();
        await subscriber.connect();

        //Listen for TTL expirations
        subscriber.subscribe('__keyevent@0__:expired', (key) => {
            // Key format will be: lock:showtimeId:seatNumber
            if (key.startsWith('lock:')) {
                const parts = key.split(":");
                const showtimeId = parts[1];
                const seatNumber = parts[2];

                //Tell all users in that showtime room that the seat is free again!
                io.to(showtimeId).emit('seat_unlocked', { seatNumber });
            }
        });
    } catch (err) {
        redisAvailable = false;
        console.log('⚠️  Redis not available — app will work without real-time seat locking');
    }

    //3.handle client connections
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        //join a room specific to the showtime ID
        socket.on('join_showtime', async (showtimeId) => {
            socket.join(showtimeId);

            if (redisAvailable) {
                const keys = await redisClient.keys(`lock:${showtimeId}:*`);
                const lockedSeats = keys.map(k => k.split(':')[2]);
                socket.emit('initial_locked_seats', lockedSeats);
            } else {
                socket.emit('initial_locked_seats', []);
            }
        });

        //when a user clicks a seat 
        socket.on('lock_seat', async ({ showtimeId, seatNumber, userId }) => {
            if (!redisAvailable) {
                // Without Redis, just broadcast the lock without persistence
                io.to(showtimeId).emit('seat_locked', { seatNumber, userId });
                return;
            }

            // Anti-Abuse: Prevent a user from locking more than 10 seats concurrently
            const showtimeKeys = await redisClient.keys(`lock:${showtimeId}:*`);
            if (showtimeKeys.length > 0) {
                const values = await redisClient.mGet(showtimeKeys);
                const userLockCount = values.filter(val => val === userId).length;
                if (userLockCount >= 10) {
                    socket.emit('lock_failed', { seatNumber, message: 'You can only hold a maximum of 10 seats at a time.' });
                    return;
                }
            }

            const key = `lock:${showtimeId}:${seatNumber}`;
            const acquired = await redisClient.setNX(key, userId);

            if (acquired) {
                await redisClient.expire(key, 10 * 60); // 10 minutes (600 seconds)
                io.to(showtimeId).emit('seat_locked', { seatNumber, userId });
            } else {
                socket.emit('lock_failed', { seatNumber, message: 'Seat already locked by someone else' });
            }
        });

        // Extend locks during payment checkout
        socket.on('extend_lock', async ({ showtimeId, userId, seatNumbers }) => {
            console.log(`📡 Received extend_lock for user: ${userId}, seats: ${seatNumbers}`);
            if (!redisAvailable || !seatNumbers || !seatNumbers.length) return;

            for (const seatNumber of seatNumbers) {
                const key = `lock:${showtimeId}:${seatNumber}`;
                const lockedBy = await redisClient.get(key);
                if (lockedBy === userId) {
                    // Grant exactly 5 bonus minutes (300 seconds) for payment processing
                    await redisClient.expire(key, 300);
                    console.log(`⏱️ Extended lock for seat ${seatNumber} to 300 seconds (User clicked Pay)`);
                }
            }
        });

        // When a user unselects a seat, immediately free it
        socket.on('unlock_seat', async ({ showtimeId, seatNumber, userId }) => {
            if (!redisAvailable) {
                io.to(showtimeId).emit('seat_unlocked', { seatNumber });
                return;
            }

            const key = `lock:${showtimeId}:${seatNumber}`;
            const lockedBy = await redisClient.get(key);

            if (lockedBy === userId) {
                await redisClient.del(key);
                io.to(showtimeId).emit('seat_unlocked', { seatNumber });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

export const getIo = () => io;
export const getRedis = () => redisClient;
