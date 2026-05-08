import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from './models/Movie.js';
import Theater from './models/Theater.js';
import Showtime from './models/Showtime.js';
import Review from './models/Review.js';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');

        // 1. Create a few users for reviews
        let users = await User.find({ role: 'user' }).limit(3);
        if (users.length === 0) {
            users = await User.create([
                { name: 'Alice Smith', email: 'alice@example.com', password: 'password123', role: 'user' },
                { name: 'Bob Jones', email: 'bob@example.com', password: 'password123', role: 'user' },
                { name: 'Charlie Brown', email: 'charlie@example.com', password: 'password123', role: 'user' }
            ]);
            console.log('Created dummy users for reviews');
        }

        // 2. Add New Movies
        const movies = await Movie.create([
            {
                title: 'Oppenheimer',
                description: 'The story of American scientist, J. Robert Oppenheimer, and his role in the development of the atomic bomb.',
                genre: ['Drama', 'Action'], // Assuming Biography/History might not be in the enum, using Drama/Action
                language: ['English'],
                duration: 180,
                releasedDate: new Date('2023-07-21'),
                posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
                director: 'Christopher Nolan'
            },
            {
                title: 'Deadpool & Wolverine',
                description: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him.',
                genre: ['Action', 'Comedy', 'Sci-Fi'],
                language: ['English', 'Hindi'],
                duration: 127,
                releasedDate: new Date('2024-07-26'),
                posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUrmU3LlGj7U2pA8bT0j.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
                director: 'Shawn Levy'
            },
            {
                title: 'Spider-Man: Across the Spider-Verse',
                description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
                genre: ['Animation', 'Action', 'Adventure'],
                language: ['English', 'Hindi', 'Tamil'],
                duration: 140,
                releasedDate: new Date('2023-06-02'),
                posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
                director: 'Joaquim Dos Santos'
            }
        ]);
        console.log('Added new movies');

        // 3. Add Reviews for these movies
        const reviewsData = [];
        
        // Oppenheimer reviews
        reviewsData.push({ movieId: movies[0]._id, userId: users[0]._id, rating: 10, comment: 'An absolute masterpiece of cinema. Nolan does it again.' });
        reviewsData.push({ movieId: movies[0]._id, userId: users[1]._id, rating: 9, comment: 'Incredible visuals and sound design. A bit long but worth it.' });
        
        // Deadpool reviews
        reviewsData.push({ movieId: movies[1]._id, userId: users[1]._id, rating: 8, comment: 'Hilarious! Ryan and Hugh have the best chemistry.' });
        reviewsData.push({ movieId: movies[1]._id, userId: users[2]._id, rating: 9, comment: 'Action packed and funny from start to finish.' });

        // Spider-Verse reviews
        reviewsData.push({ movieId: movies[2]._id, userId: users[0]._id, rating: 10, comment: 'The animation is breathtaking. Best superhero movie.' });
        reviewsData.push({ movieId: movies[2]._id, userId: users[2]._id, rating: 10, comment: 'A perfect sequel. Every frame is a painting.' });

        await Review.create(reviewsData);
        console.log('Added reviews');

        // Update movie averages
        for (let movie of movies) {
            const reviews = await Review.find({ movieId: movie._id });
            const avg = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
            await Movie.findByIdAndUpdate(movie._id, {
                averageRating: Number(avg.toFixed(1)),
                totalReviews: reviews.length
            });
        }
        console.log('Updated movie ratings');

        // 4. Add Showtimes for the new movies
        const theaters = await Theater.find().limit(2);
        if (theaters.length > 0) {
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

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0,0,0,0);

            const showtimes = [];

            // Add Oppenheimer to Theater 1
            if(theaters[0]) {
                showtimes.push({
                    movieId: movies[0]._id,
                    theaterId: theaters[0]._id,
                    screenId: theaters[0].screens[0]._id,
                    showDate: tomorrow,
                    showTime: '12:00 PM',
                    pricing: { vip: 500, premium: 350, economy: 200 },
                    seatStatus: generateSeatStatus(theaters[0], theaters[0].screens[0]._id),
                    totalSeatAvailable: 60
                });
            }

            // Add Deadpool to Theater 2
            if(theaters[1]) {
                showtimes.push({
                    movieId: movies[1]._id,
                    theaterId: theaters[1]._id,
                    screenId: theaters[1].screens[0]._id,
                    showDate: tomorrow,
                    showTime: '06:30 PM',
                    pricing: { vip: 600, premium: 400, economy: 250 },
                    seatStatus: generateSeatStatus(theaters[1], theaters[1].screens[0]._id),
                    totalSeatAvailable: 60
                });
            }

            // Add Spider-Verse to Theater 1
            if(theaters[0]) {
                showtimes.push({
                    movieId: movies[2]._id,
                    theaterId: theaters[0]._id,
                    screenId: theaters[0].screens[0]._id,
                    showDate: tomorrow,
                    showTime: '04:00 PM',
                    pricing: { vip: 450, premium: 300, economy: 180 },
                    seatStatus: generateSeatStatus(theaters[0], theaters[0].screens[0]._id),
                    totalSeatAvailable: 60
                });
            }

            if(showtimes.length > 0) {
                await Showtime.create(showtimes);
                console.log('Added showtimes for new movies');
            }
        }

        console.log('Seeding complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
