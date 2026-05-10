/**
 * Production Seed Script for Cinereserve Pro
 * 
 * Usage:
 *   1. Set MONGO_URI in your .env to your MongoDB Atlas connection string
 *   2. Run: node seed-production.js
 *   3. Set MONGO_URI back to localhost if needed
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from './models/Movie.js';
import Theater from './models/Theater.js';
import Showtime from './models/Showtime.js';
import User from './models/User.js';
import Review from './models/Review.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI not set in .env');
    process.exit(1);
}

console.log(`🔗 Connecting to: ${MONGO_URI.substring(0, 30)}...`);

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        // ============================================
        // 1. CREATE USERS (Admin, Partner, Staff)
        // ============================================
        console.log('\n👤 Creating users...');

        // Check if admin already exists
        let admin = await User.findOne({ email: 'admin@cinereserve.com' });
        if (!admin) {
            admin = await User.create({
                name: 'Super Admin',
                email: 'admin@cinereserve.com',
                password: 'admin123',
                phone: '9999999999',
                role: 'admin',
                isApproved: true
            });
            console.log('  ✅ Admin created: admin@cinereserve.com / admin123');
        } else {
            console.log('  ⏩ Admin already exists');
        }

        let partner = await User.findOne({ email: 'partner@pvr.com' });
        if (!partner) {
            partner = await User.create({
                name: 'PVR Manager',
                email: 'partner@pvr.com',
                password: 'partner123',
                phone: '8888888888',
                role: 'theater_admin',
                isApproved: true,
                businessName: 'PVR Cinemas'
            });
            console.log('  ✅ Partner created: partner@pvr.com / partner123');
        } else {
            console.log('  ⏩ Partner already exists');
        }

        let staff = await User.findOne({ email: 'staff@cinereserve.com' });
        if (!staff) {
            staff = await User.create({
                name: 'Scanner Staff',
                email: 'staff@cinereserve.com',
                password: 'staff123',
                phone: '7777777777',
                role: 'staff',
                isApproved: true
            });
            console.log('  ✅ Staff created: staff@cinereserve.com / staff123');
        } else {
            console.log('  ⏩ Staff already exists');
        }

        let demoUser = await User.findOne({ email: 'user@demo.com' });
        if (!demoUser) {
            demoUser = await User.create({
                name: 'Demo User',
                email: 'user@demo.com',
                password: 'user123',
                phone: '6666666666',
                role: 'user',
                isApproved: true
            });
            console.log('  ✅ Demo user created: user@demo.com / user123');
        } else {
            console.log('  ⏩ Demo user already exists');
        }

        // ============================================
        // 2. CREATE MOVIES
        // ============================================
        console.log('\n🎬 Creating movies...');

        // Clear existing movies, theaters, showtimes
        await Movie.deleteMany({});
        await Theater.deleteMany({});
        await Showtime.deleteMany({});
        await Review.deleteMany({});
        console.log('  🗑️  Cleared old movies, theaters, showtimes, reviews');

        const movies = await Movie.create([
            {
                title: 'Interstellar',
                description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival. When a newly discovered wormhole in the far reaches of the solar system allows travel to distant galaxies, a team of NASA scientists, engineers and pilots sets out on the most important mission in human history.',
                genre: ['Action', 'Adventure', 'Sci-Fi'],
                language: ['English', 'Hindi'],
                duration: 169,
                releasedDate: new Date('2014-11-07'),
                rating: 8.7,
                posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QlsUUHXjNpeVD0CfltPciOM.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
                director: 'Christopher Nolan',
                cast: [
                    { name: 'Matthew McConaughey', role: 'Cooper' },
                    { name: 'Anne Hathaway', role: 'Dr. Brand' },
                    { name: 'Jessica Chastain', role: 'Murph' }
                ]
            },
            {
                title: 'Dune: Part Two',
                description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
                genre: ['Action', 'Adventure', 'Sci-Fi'],
                language: ['English'],
                duration: 166,
                releasedDate: new Date('2024-03-01'),
                rating: 8.8,
                posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2TDpiuLTe.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
                director: 'Denis Villeneuve',
                cast: [
                    { name: 'Timothée Chalamet', role: 'Paul Atreides' },
                    { name: 'Zendaya', role: 'Chani' },
                    { name: 'Austin Butler', role: 'Feyd-Rautha' }
                ]
            },
            {
                title: 'The Dark Knight',
                description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
                genre: ['Action', 'Thriller', 'Drama'],
                language: ['English', 'Hindi'],
                duration: 152,
                releasedDate: new Date('2008-07-18'),
                rating: 9.0,
                posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BytUgMoVhB69.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
                director: 'Christopher Nolan',
                cast: [
                    { name: 'Christian Bale', role: 'Bruce Wayne' },
                    { name: 'Heath Ledger', role: 'Joker' },
                    { name: 'Aaron Eckhart', role: 'Harvey Dent' }
                ]
            },
            {
                title: 'Oppenheimer',
                description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
                genre: ['Drama', 'Thriller'],
                language: ['English', 'Hindi'],
                duration: 180,
                releasedDate: new Date('2023-07-21'),
                rating: 8.5,
                posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
                director: 'Christopher Nolan',
                cast: [
                    { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer' },
                    { name: 'Emily Blunt', role: 'Kitty Oppenheimer' },
                    { name: 'Robert Downey Jr.', role: 'Lewis Strauss' }
                ]
            },
            {
                title: 'Inception',
                description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
                genre: ['Action', 'Sci-Fi', 'Thriller'],
                language: ['English', 'Hindi'],
                duration: 148,
                releasedDate: new Date('2010-07-16'),
                rating: 8.8,
                posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
                director: 'Christopher Nolan',
                cast: [
                    { name: 'Leonardo DiCaprio', role: 'Cobb' },
                    { name: 'Joseph Gordon-Levitt', role: 'Arthur' },
                    { name: 'Elliot Page', role: 'Ariadne' }
                ]
            },
            {
                title: 'RRR',
                description: 'A fictitious story about two legendary revolutionaries and their journey away from home before they started fighting for their country in the 1920s.',
                genre: ['Action', 'Drama'],
                language: ['Hindi', 'Telugu'],
                duration: 187,
                releasedDate: new Date('2022-03-25'),
                rating: 7.8,
                posterUrl: 'https://image.tmdb.org/t/p/w500/nEufeZYoDBPKgfPkGD9RkFOwdag.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=f_vbAtFSEc0',
                director: 'S.S. Rajamouli',
                cast: [
                    { name: 'N.T. Rama Rao Jr.', role: 'Komaram Bheem' },
                    { name: 'Ram Charan', role: 'Alluri Sitarama Raju' },
                    { name: 'Alia Bhatt', role: 'Sita' }
                ]
            }
        ]);
        console.log(`  ✅ ${movies.length} movies created`);

        // ============================================
        // 3. CREATE THEATERS
        // ============================================
        console.log('\n🏢 Creating theaters...');

        const theaters = await Theater.create([
            {
                name: 'PVR IMAX: Phoenix Palladium',
                location: { city: 'Mumbai', address: 'Phoenix Palladium, Lower Parel' },
                facilities: ['IMAX', 'Parking', 'Food Court'],
                screens: [{
                    screenNumber: 1,
                    screenName: 'IMAX Screen',
                    totalSeats: 60,
                    seatLayout: { rows: 6, columns: 10 },
                    seatType: [
                        { type: 'Economy', rows: ['A', 'B'], basePrice: 200 },
                        { type: 'Premium', rows: ['C', 'D'], basePrice: 350 },
                        { type: 'VIP', rows: ['E', 'F'], basePrice: 500 }
                    ]
                }]
            },
            {
                name: 'INOX: Select Citywalk',
                location: { city: 'Delhi', address: 'Select Citywalk, Saket' },
                facilities: ['4DX', 'Parking', 'Food Court'],
                screens: [{
                    screenNumber: 1,
                    screenName: '4DX Screen',
                    totalSeats: 60,
                    seatLayout: { rows: 6, columns: 10 },
                    seatType: [
                        { type: 'Economy', rows: ['A', 'B'], basePrice: 250 },
                        { type: 'Premium', rows: ['C', 'D'], basePrice: 400 },
                        { type: 'VIP', rows: ['E', 'F'], basePrice: 600 }
                    ]
                }]
            },
            {
                name: 'Cinepolis: Forum Mall',
                location: { city: 'Bangalore', address: 'Forum Value Mall, Whitefield' },
                facilities: ['Dolby Atmos', 'Parking', 'Food Court', 'Wheelchair Access'],
                screens: [{
                    screenNumber: 1,
                    screenName: 'Dolby Atmos Screen',
                    totalSeats: 60,
                    seatLayout: { rows: 6, columns: 10 },
                    seatType: [
                        { type: 'Economy', rows: ['A', 'B'], basePrice: 180 },
                        { type: 'Premium', rows: ['C', 'D'], basePrice: 300 },
                        { type: 'VIP', rows: ['E', 'F'], basePrice: 450 }
                    ]
                }]
            }
        ]);
        console.log(`  ✅ ${theaters.length} theaters created`);

        // ============================================
        // 4. CREATE SHOWTIMES (multiple days)
        // ============================================
        console.log('\n🕐 Creating showtimes...');

        // Helper to generate seat status
        const generateSeatStatus = (theater, screenId) => {
            const screen = theater.screens.id(screenId);
            const seats = [];
            const { rows, columns } = screen.seatLayout;
            for (let r = 0; r < rows; r++) {
                const rowLetter = String.fromCharCode(65 + r);
                let seatType = 'Economy';
                for (const type of screen.seatType) {
                    if (type.rows.includes(rowLetter)) {
                        seatType = type.type;
                        break;
                    }
                }
                for (let c = 1; c <= columns; c++) {
                    seats.push({
                        seatNumber: `${rowLetter}${c}`,
                        status: 'Available',
                        seatType: seatType
                    });
                }
            }
            return seats;
        };

        const showtimeData = [];
        const showTimes = ['10:00 AM', '01:30 PM', '04:00 PM', '07:30 PM', '10:30 PM'];

        // Create showtimes for the next 5 days
        for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
            const showDate = new Date();
            showDate.setDate(showDate.getDate() + dayOffset);
            showDate.setHours(0, 0, 0, 0);

            // Each movie gets 2-3 showtimes across different theaters
            for (let i = 0; i < movies.length; i++) {
                const movie = movies[i];
                const theater = theaters[i % theaters.length];
                const screen = theater.screens[0];

                // Give each movie 2 showtimes per day
                const timeSlot1 = showTimes[i % showTimes.length];
                const timeSlot2 = showTimes[(i + 2) % showTimes.length];

                showtimeData.push({
                    movieId: movie._id,
                    theaterId: theater._id,
                    screenId: screen._id,
                    showDate,
                    showTime: timeSlot1,
                    pricing: {
                        vip: screen.seatType.find(s => s.type === 'VIP')?.basePrice || 500,
                        premium: screen.seatType.find(s => s.type === 'Premium')?.basePrice || 350,
                        economy: screen.seatType.find(s => s.type === 'Economy')?.basePrice || 200
                    },
                    seatStatus: generateSeatStatus(theater, screen._id),
                    totalSeatAvailable: screen.totalSeats
                });

                showtimeData.push({
                    movieId: movie._id,
                    theaterId: theater._id,
                    screenId: screen._id,
                    showDate,
                    showTime: timeSlot2,
                    pricing: {
                        vip: screen.seatType.find(s => s.type === 'VIP')?.basePrice || 500,
                        premium: screen.seatType.find(s => s.type === 'Premium')?.basePrice || 350,
                        economy: screen.seatType.find(s => s.type === 'Economy')?.basePrice || 200
                    },
                    seatStatus: generateSeatStatus(theater, screen._id),
                    totalSeatAvailable: screen.totalSeats
                });
            }
        }

        const showtimes = await Showtime.create(showtimeData);
        console.log(`  ✅ ${showtimes.length} showtimes created across 5 days`);

        // ============================================
        // 5. CREATE REVIEWS
        // ============================================
        console.log('\n⭐ Creating reviews...');

        const reviews = await Review.create([
            { movieId: movies[0]._id, userId: demoUser._id, rating: 9, comment: 'An absolute masterpiece! The visuals and soundtrack are breathtaking.' },
            { movieId: movies[1]._id, userId: demoUser._id, rating: 9, comment: 'Even better than Part One. The desert scenes are incredible.' },
            { movieId: movies[2]._id, userId: demoUser._id, rating: 10, comment: 'Heath Ledger\'s Joker is the greatest villain performance of all time.' },
            { movieId: movies[3]._id, userId: demoUser._id, rating: 8, comment: 'A powerful biopic. Cillian Murphy deserves every award.' },
            { movieId: movies[4]._id, userId: demoUser._id, rating: 9, comment: 'Mind-bending plot that keeps you thinking for days!' },
            { movieId: movies[5]._id, userId: demoUser._id, rating: 8, comment: 'The action sequences are on another level. Pure entertainment!' },
        ]);

        // Update movie review stats
        for (const movie of movies) {
            const movieReviews = reviews.filter(r => r.movieId.toString() === movie._id.toString());
            const avgRating = movieReviews.reduce((sum, r) => sum + r.rating, 0) / movieReviews.length;
            await Movie.findByIdAndUpdate(movie._id, {
                averageRating: Math.round(avgRating * 10) / 10,
                totalReviews: movieReviews.length
            });
        }
        console.log(`  ✅ ${reviews.length} reviews created`);

        // ============================================
        // SUMMARY
        // ============================================
        console.log('\n' + '='.repeat(50));
        console.log('🎉 PRODUCTION SEED COMPLETE!');
        console.log('='.repeat(50));
        console.log('\n📋 Login Credentials:');
        console.log('  🔴 Admin:   admin@cinereserve.com / admin123');
        console.log('  🟠 Partner: partner@pvr.com / partner123');
        console.log('  🟢 Staff:   staff@cinereserve.com / staff123');
        console.log('  🔵 User:    user@demo.com / user123');
        console.log('\n📊 Data Created:');
        console.log(`  🎬 ${movies.length} Movies`);
        console.log(`  🏢 ${theaters.length} Theaters`);
        console.log(`  🕐 ${showtimes.length} Showtimes`);
        console.log(`  ⭐ ${reviews.length} Reviews`);
        console.log(`  👤 4 User Accounts`);
        console.log('');

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    });
