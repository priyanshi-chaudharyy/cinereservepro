import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from './models/Movie.js';
import Theater from './models/Theater.js';
import Showtime from './models/Showtime.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        
        // 1. Add Movies
        const movies = await Movie.create([
            {
                title: 'Interstellar',
                description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
                genre: ['Action', 'Adventure', 'Sci-Fi'],
                language: ['English', 'Hindi'],
                duration: 169,
                releasedDate: new Date('2014-11-07'),
                rating: 8.7,
                posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QlsUUHXjNpeVD0CfltPciOM.jpg',
                director: 'Christopher Nolan'
            },
            {
                title: 'Dune: Part Two',
                description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
                genre: ['Action', 'Adventure', 'Sci-Fi'],
                language: ['English'],
                duration: 166,
                releasedDate: new Date('2024-03-01'),
                rating: 8.8,
                posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2TDpiuLTe.jpg',
                director: 'Denis Villeneuve'
            }
        ]);
        console.log('Movies created');

        // 2. Add Theaters
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
            }
        ]);
        console.log('Theaters created');

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

        // 3. Add Showtimes
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0,0,0,0);

        const showtimes = await Showtime.create([
            {
                movieId: movies[0]._id,
                theaterId: theaters[0]._id,
                screenId: theaters[0].screens[0]._id,
                showDate: tomorrow,
                showTime: '10:00 AM',
                pricing: { vip: 500, premium: 350, economy: 200 },
                seatStatus: generateSeatStatus(theaters[0], theaters[0].screens[0]._id),
                totalSeatAvailable: 60
            },
            {
                movieId: movies[1]._id,
                theaterId: theaters[0]._id,
                screenId: theaters[0].screens[0]._id,
                showDate: tomorrow,
                showTime: '01:30 PM',
                pricing: { vip: 500, premium: 350, economy: 200 },
                seatStatus: generateSeatStatus(theaters[0], theaters[0].screens[0]._id),
                totalSeatAvailable: 60
            },
            {
                movieId: movies[0]._id,
                theaterId: theaters[1]._id,
                screenId: theaters[1].screens[0]._id,
                showDate: tomorrow,
                showTime: '11:00 AM',
                pricing: { vip: 600, premium: 400, economy: 250 },
                seatStatus: generateSeatStatus(theaters[1], theaters[1].screens[0]._id),
                totalSeatAvailable: 60
            },
            {
                movieId: movies[1]._id,
                theaterId: theaters[1]._id,
                screenId: theaters[1].screens[0]._id,
                showDate: tomorrow,
                showTime: '03:00 PM',
                pricing: { vip: 600, premium: 400, economy: 250 },
                seatStatus: generateSeatStatus(theaters[1], theaters[1].screens[0]._id),
                totalSeatAvailable: 60
            }
        ]);
        console.log('Showtimes created');
        
        console.log('Seeding complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
