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

        let admin = await User.findOne({ email: 'admin@cinereserve.com' });
        if (!admin) {
            admin = await User.create({ name: 'Super Admin', email: 'admin@cinereserve.com', password: 'admin123', phone: '9999999999', role: 'admin', isApproved: true });
        }

        let partner = await User.findOne({ email: 'partner@pvr.com' });
        if (!partner) {
            partner = await User.create({ name: 'PVR Manager', email: 'partner@pvr.com', password: 'partner123', phone: '8888888888', role: 'theater_admin', isApproved: true, businessName: 'PVR Cinemas' });
        }

        let inoxPartner = await User.findOne({ email: 'partner@inox.com' });
        if (!inoxPartner) {
            inoxPartner = await User.create({ name: 'INOX Manager', email: 'partner@inox.com', password: 'partner123', phone: '8888888887', role: 'theater_admin', isApproved: true, businessName: 'INOX' });
        }

        let cinepolisPartner = await User.findOne({ email: 'partner@cinepolis.com' });
        if (!cinepolisPartner) {
            cinepolisPartner = await User.create({ name: 'Cinepolis Manager', email: 'partner@cinepolis.com', password: 'partner123', phone: '8888888886', role: 'theater_admin', isApproved: true, businessName: 'Cinepolis' });
        }

        let staff = await User.findOne({ email: 'staff@cinereserve.com' });
        if (!staff) {
            staff = await User.create({ name: 'Scanner Staff', email: 'staff@cinereserve.com', password: 'staff123', phone: '7777777777', role: 'staff', isApproved: true });
        }

        let demoUser = await User.findOne({ email: 'user@demo.com' });
        if (!demoUser) {
            demoUser = await User.create({ name: 'Demo User', email: 'user@demo.com', password: 'user123', phone: '6666666666', role: 'user', isApproved: true });
        }

        // ============================================
        // 2. CREATE MOVIES
        // ============================================
        console.log('\n🎬 Creating movies...');

        await Movie.deleteMany({});
        await Theater.deleteMany({});
        await Showtime.deleteMany({});
        await Review.deleteMany({});
        console.log('  🗑️  Cleared old movies, theaters, showtimes, reviews');

        const movies = await Movie.create([
            {
                title: 'Interstellar',
                description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
                genre: ['Action', 'Adventure', 'Sci-Fi'],
                language: ['English', 'Hindi'],
                duration: 169,
                releasedDate: new Date('2014-11-07'),
                rating: 8.7,
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
                director: 'Christopher Nolan',
                cast: [{ name: 'Matthew McConaughey', role: 'Cooper' }]
            },
            {
                title: 'Dune: Part Two',
                description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
                genre: ['Action', 'Adventure', 'Sci-Fi'],
                language: ['English'],
                duration: 166,
                releasedDate: new Date('2024-03-01'),
                rating: 8.8,
                posterUrl: 'https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p26702084_p_v8_aa.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
                director: 'Denis Villeneuve',
                cast: [{ name: 'Timothée Chalamet', role: 'Paul Atreides' }]
            },
            {
                title: 'The Dark Knight',
                description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
                genre: ['Action', 'Thriller', 'Drama'],
                language: ['English', 'Hindi'],
                duration: 152,
                releasedDate: new Date('2008-07-18'),
                rating: 9.0,
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
                director: 'Christopher Nolan',
                cast: [{ name: 'Christian Bale', role: 'Bruce Wayne' }]
            },
            {
                title: 'Oppenheimer',
                description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
                genre: ['Drama', 'Thriller'],
                language: ['English', 'Hindi'],
                duration: 180,
                releasedDate: new Date('2023-07-21'),
                rating: 8.5,
                posterUrl: 'https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_SX300.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
                director: 'Christopher Nolan',
                cast: [{ name: 'Cillian Murphy', role: 'J. Robert Oppenheimer' }]
            },
            {
                title: 'Inception',
                description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
                genre: ['Action', 'Sci-Fi', 'Thriller'],
                language: ['English', 'Hindi'],
                duration: 148,
                releasedDate: new Date('2010-07-16'),
                rating: 8.8,
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
                director: 'Christopher Nolan',
                cast: [{ name: 'Leonardo DiCaprio', role: 'Cobb' }]
            },
            {
                title: 'RRR',
                description: 'A fictitious story about two legendary revolutionaries and their journey away from home before they started fighting for their country in the 1920s.',
                genre: ['Action', 'Drama'],
                language: ['Hindi', 'Telugu'],
                duration: 187,
                releasedDate: new Date('2022-03-25'),
                rating: 7.8,
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d7/RRR_Poster.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=f_vbAtFSEc0',
                director: 'S.S. Rajamouli',
                cast: [{ name: 'Ram Charan', role: 'Alluri Sitarama Raju' }]
            },
            {
                title: 'Avatar: The Way of Water',
                description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
                genre: ['Action', 'Adventure', 'Sci-Fi'],
                language: ['English', 'Hindi', 'Tamil', 'Telugu'],
                duration: 192,
                releasedDate: new Date('2022-12-16'),
                rating: 7.6,
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/5/54/Avatar_The_Way_of_Water_poster.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
                director: 'James Cameron',
                cast: [{ name: 'Sam Worthington', role: 'Jake Sully' }]
            },
            {
                title: 'Spider-Man: Across the Spider-Verse',
                description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
                genre: ['Animation', 'Action', 'Adventure'],
                language: ['English', 'Hindi'],
                duration: 140,
                releasedDate: new Date('2023-06-02'),
                rating: 8.7,
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Spider-Man-_Across_the_Spider-Verse_poster.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=shW9i6k8cB0',
                director: 'Joaquim Dos Santos',
                cast: [{ name: 'Shameik Moore', role: 'Miles Morales' }]
            },
            {
                title: 'Avengers: Endgame',
                description: 'After the devastating events of Infinity War, the remaining Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
                genre: ['Action', 'Adventure', 'Sci-Fi'],
                language: ['English', 'Hindi', 'Tamil', 'Telugu'],
                duration: 181,
                releasedDate: new Date('2019-04-26'),
                rating: 8.4,
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
                director: 'Anthony Russo, Joe Russo',
                cast: [{ name: 'Robert Downey Jr.', role: 'Tony Stark' }]
            },
            {
                title: 'The Matrix',
                description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
                genre: ['Action', 'Sci-Fi'],
                language: ['English'],
                duration: 136,
                releasedDate: new Date('1999-03-31'),
                rating: 8.7,
                posterUrl: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
                director: 'Lana Wachowski, Lilly Wachowski',
                cast: [{ name: 'Keanu Reeves', role: 'Neo' }]
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
                ownerId: partner._id,
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
                ownerId: inoxPartner._id,
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
                ownerId: cinepolisPartner._id,
                location: { city: 'Bangalore', address: 'Forum Mall, Koramangala' },
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

        const generateSeatStatus = (theater, screenId) => {
            const screen = theater.screens.id(screenId);
            const seats = [];
            const { rows, columns } = screen.seatLayout;
            for (let r = 0; r < rows; r++) {
                const rowLetter = String.fromCharCode(65 + r);
                let seatType = 'Economy';
                for (const type of screen.seatType) {
                    if (type.rows.includes(rowLetter)) { seatType = type.type; break; }
                }
                for (let c = 1; c <= columns; c++) {
                    seats.push({ seatNumber: `${rowLetter}${c}`, status: 'Available', seatType });
                }
            }
            return seats;
        };

        const showtimeData = [];
        const showTimes = ['10:00 AM', '01:30 PM', '04:00 PM', '07:30 PM', '10:30 PM'];

        for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
            const showDate = new Date();
            showDate.setDate(showDate.getDate() + dayOffset);
            showDate.setHours(0, 0, 0, 0);

            // Movie Distribution Rules:
            // Movies 0-3: Available in all 3 theaters
            // Movies 4-6: Available in 2 theaters
            // Movies 7-9: Available only in 1 theater (Exclusive)

            for (let i = 0; i < movies.length; i++) {
                const movie = movies[i];
                
                let assignedTheaters = [];
                if (i < 4) assignedTheaters = theaters; // All theaters
                else if (i < 7) assignedTheaters = [theaters[0], theaters[1]]; // 2 theaters
                else assignedTheaters = [theaters[2]]; // 1 theater only

                for (const theater of assignedTheaters) {
                    const screen = theater.screens[0];
                    
                    // 1-2 showtimes per theater per day
                    const timeSlot1 = showTimes[i % showTimes.length];
                    const timeSlot2 = showTimes[(i + 3) % showTimes.length];

                    showtimeData.push({
                        movieId: movie._id, theaterId: theater._id, screenId: screen._id,
                        showDate, showTime: timeSlot1,
                        pricing: {
                            vip: screen.seatType.find(s => s.type === 'VIP')?.basePrice || 500,
                            premium: screen.seatType.find(s => s.type === 'Premium')?.basePrice || 350,
                            economy: screen.seatType.find(s => s.type === 'Economy')?.basePrice || 200
                        },
                        seatStatus: generateSeatStatus(theater, screen._id),
                        totalSeatAvailable: screen.totalSeats
                    });

                    // Add second showtime only for some
                    if (i % 2 === 0) {
                        showtimeData.push({
                            movieId: movie._id, theaterId: theater._id, screenId: screen._id,
                            showDate, showTime: timeSlot2,
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
            }
        }

        const showtimes = await Showtime.create(showtimeData);
        console.log(`  ✅ ${showtimes.length} showtimes created across 5 days`);

        console.log('\n🌟 Creating reviews...');
        for (const movie of movies) {
            const randomRating = Math.floor(Math.random() * 3) + 7; // 7 to 9
            await Review.create({
                movieId: movie._id,
                userId: demoUser._id,
                rating: randomRating,
                comment: `Great movie! Loved watching ${movie.title}.`
            });
            await Movie.findByIdAndUpdate(movie._id, {
                rating: randomRating,
                averageRating: randomRating,
                totalReviews: 1
            });
        }
        console.log(`  ✅ ${movies.length} reviews created and movies updated`);

        // ============================================
        // DONE
        // ============================================
        console.log('\n==================================================');
        console.log('🎉 PRODUCTION SEED COMPLETE!');
        console.log('==================================================');

        console.log('\n📊 Data Created:');
        console.log(`  🎬 ${movies.length} Movies`);
        console.log(`  🏢 ${theaters.length} Theaters`);
        console.log(`  🕐 ${showtimes.length} Showtimes`);
        console.log(`  🌟 ${movies.length} Reviews`);
        console.log('');

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    });
