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

        const moviesSeed = [
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
                cast: [
                    { name: 'Matthew McConaughey', role: 'Cooper', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/matthew-mcconaughey-4593-1648122667.jpg' },
                    { name: 'Anne Hathaway', role: 'Brand', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/anne-hathaway-191-1774583647.jpg' },
                    { name: 'Jessica Chastain', role: 'Murph', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/jessica-chastain-21962-24-03-2017-17-30-03.jpg' },
                    { name: 'Michael Caine', role: 'Professor Brand', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/michael-caine-1449-20-03-2018-12-54-52.jpg' }
                ],
                crew: [
                    { name: 'Christopher Nolan', role: 'Director', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/christopher-nolan-448-12-09-2017-06-17-25.jpg' },
                    { name: 'Hans Zimmer', role: 'Composer', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/hans-zimmer-786-24-03-2017-12-32-04.jpg' },
                    { name: 'Hoyte van Hoytema', role: 'Cinematography', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/hoyte-van-hoytema-iein103023-13-07-2017-12-51-32.jpg' }
                ]
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
                cast: [
                    { name: 'Timothee Chalamet', role: 'Paul Atreides', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/timoth_e-chalamet-1090896-19-02-2019-12-36-29.jpg' },
                    { name: 'Zendaya', role: 'Chani', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/zendaya-2016258-1684991803.jpg' },
                    { name: 'Rebecca Ferguson', role: 'Lady Jessica', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/rebecca-ferguson-1048045-24-03-2017-16-12-13.jpg' },
                    { name: 'Javier Bardem', role: 'Stilgar', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/javier-bardem-7072-1657700208.jpg' }
                ],
                crew: [
                    { name: 'Denis Villeneuve', role: 'Director', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/denis-villeneuve-38094-1707799677.jpg' },
                    { name: 'Hans Zimmer', role: 'Composer', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/hans-zimmer-786-24-03-2017-12-32-04.jpg' }
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
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
                director: 'Christopher Nolan',
                cast: [
                    { name: 'Christian Bale', role: 'Bruce Wayne', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/christian-bale-440-24-03-2017-12-31-22.jpg' },
                    { name: 'Heath Ledger', role: 'Joker', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/heath-ledger-805-08-07-2020-02-43-56.jpg' },
                    { name: 'Aaron Eckhart', role: 'Harvey Dent', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/aaron-eckhart-2754-1667969179.jpg' },
                    { name: 'Gary Oldman', role: 'Jim Gordon', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/gary-oldman-716-1771394992.jpg' }
                ],
                crew: [
                    { name: 'Christopher Nolan', role: 'Director', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/christopher-nolan-448-12-09-2017-06-17-25.jpg' },
                    { name: 'Emma Thomas', role: 'Producer', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/emma-thomas-iein096114-13-07-2017-12-52-40.jpg' },
                    { name: 'Hans Zimmer', role: 'Composer', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/hans-zimmer-786-24-03-2017-12-32-04.jpg' }
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
                posterUrl: 'https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_SX300.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
                director: 'Christopher Nolan',
                cast: [
                    { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/cillian-murphy-455-24-03-2017-12-58-10.jpg' },
                    { name: 'Emily Blunt', role: 'Kitty Oppenheimer', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/emily-blunt-4134-1758530443.jpg' },
                    { name: 'Matt Damon', role: 'Leslie Groves', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/matt-damon-1415-24-03-2017-12-31-21.jpg' },
                    { name: 'Robert Downey Jr.', role: 'Lewis Strauss', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/robert-downey-jr-1902-17-12-2018-02-26-59.jpg' }
                ],
                crew: [
                    { name: 'Christopher Nolan', role: 'Director', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/christopher-nolan-448-12-09-2017-06-17-25.jpg' },
                    { name: 'Ludwig Goransson', role: 'Composer', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/ludwig-goransson-1061733-24-03-2017-13-20-15.jpg' },
                    { name: 'Hoyte van Hoytema', role: 'Cinematography', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/hoyte-van-hoytema-iein103023-13-07-2017-12-51-32.jpg' }
                ]
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
                cast: [
                    { name: 'Leonardo DiCaprio', role: 'Cobb', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/leonardo-dicaprio-1273-06-05-2020-06-55-21.jpg' },
                    { name: 'Joseph Gordon-Levitt', role: 'Arthur', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/joseph-gordon-levitt-13608-24-03-2017-12-42-16.jpg' },
                    { name: 'Elliot Page', role: 'Ariadne', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/elliot-page-5394-1658904558.jpg' },
                    { name: 'Tom Hardy', role: 'Eames', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/tom-hardy-8994-24-03-2017-12-37-04.jpg' }
                ],
                crew: [
                    { name: 'Christopher Nolan', role: 'Director', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/christopher-nolan-448-12-09-2017-06-17-25.jpg' },
                    { name: 'Hans Zimmer', role: 'Composer', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/hans-zimmer-786-24-03-2017-12-32-04.jpg' }
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
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d7/RRR_Poster.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=f_vbAtFSEc0',
                director: 'S.S. Rajamouli',
                cast: [
                    { name: 'Ram Charan', role: 'Alluri Sitarama Raju', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/ram-charan-teja-1046368-19-09-2017-02-37-43.jpg' },
                    { name: 'Alia Bhatt', role: 'Sita', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/alia-bhatt-21065-1685013962.jpg' },
                    { name: 'Ajay Devgn', role: 'Venkata Rama Raju', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/ajay-devgn-24051-12-09-2017-04-41-13.jpg' }
                ]
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
                cast: [
                    { name: 'Sam Worthington', role: 'Jake Sully', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/sam-worthington-12089-24-03-2017-12-32-07.jpg' },
                    { name: 'Zoe Saldana', role: 'Neytiri', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/zoe-saldana-3261-13-10-2017-03-54-34.jpg' },
                    { name: 'Sigourney Weaver', role: 'Kiri', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/sigourney-weaver-3258-24-03-2017-17-32-08.jpg' },
                    { name: 'Stephen Lang', role: 'Quaritch', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/stephen-lang-15008-24-03-2017-12-44-36.jpg' }
                ],
                crew: [
                    { name: 'James Cameron', role: 'Director', imageUrl: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/james-cameron-5030-13-09-2017-01-57-54.jpg' }
                ]
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
                cast: [
                    { name: 'Shameik Moore', role: 'Miles Morales', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/shameik-moore-1096516-26-10-2018-14-39-27.jpg' },
                    { name: 'Hailee Steinfeld', role: 'Gwen Stacy', imageUrl: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/hailee-steinfeld-21087-26-10-2017-11-47-07.jpg' },
                    { name: 'Oscar Isaac', role: 'Miguel O Hara', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/oscar-isaac-7068-24-03-2017-15-48-32.jpg' },
                    { name: 'Jake Johnson', role: 'Peter B. Parker', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/jake-johnson-39023-13-04-2017-18-09-33.jpg' }
                ],
                crew: [
                    { name: 'Joaquim Dos Santos', role: 'Director', imageUrl: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/joaquim-dos-santos-2024582-1671020956.jpg' },
                    { name: 'Amy Pascal', role: 'Producer', imageUrl: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/amy-pascal-1084057-08-11-2017-12-48-54.jpg' }
                ]
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
                cast: [
                    { name: 'Robert Downey Jr.', role: 'Tony Stark', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/robert-downey-jr-1902-17-12-2018-02-26-59.jpg' },
                    { name: 'Chris Evans', role: 'Steve Rogers', imageUrl: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/chris-evans-430-22-12-2017-10-13-37.jpg' },
                    { name: 'Scarlett Johansson', role: 'Natasha Romanoff', imageUrl: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/scarlett-johansson-2067-22-12-2017-09-56-57.jpg' },
                    { name: 'Chris Hemsworth', role: 'Thor', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/chris-hemsworth-24185-24-03-2017-12-37-46.jpg' }
                ],
                crew: [
                    { name: 'Anthony Russo', role: 'Director', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/anthony-russo-201-24-03-2017-15-21-49.jpg' },
                    { name: 'Joe Russo', role: 'Director', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/joe-russo-1010-24-03-2017-15-20-22.jpg' },
                    { name: 'Alan Silvestri', role: 'Composer', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/alan-silvestri-99-24-03-2017-12-39-31.jpg' }
                ]
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
                cast: [
                    { name: 'Keanu Reeves', role: 'Neo', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/keanu-reeves-1178-24-03-2017-13-51-06.jpg' },
                    { name: 'Carrie-Anne Moss', role: 'Trinity', imageUrl: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/carrie-anne-moss-392-24-03-2017-17-29-21.jpg' },
                    { name: 'Laurence Fishburne', role: 'Morpheus', imageUrl: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/laurence-fishburne-1264-1771232678.jpg' },
                    { name: 'Hugo Weaving', role: 'Agent Smith', imageUrl: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/hugo-weaving-837-24-03-2017-12-42-16.jpg' }
                ],
                crew: [
                    { name: 'Lana Wachowski', role: 'Director', imageUrl: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/lana-wachowski-31019-24-03-2017-12-39-30.jpg' },
                    { name: 'Don Davis', role: 'Composer', imageUrl: 'https://assets-in.bmscdn.com/iedb/artist/images/website/poster/large/don-davis-iein003709-24-03-2017-12-51-31.jpg' }
                ]
            }
        ];

        const normalizedMovies = moviesSeed.map(movie => ({
            ...movie,
            cast: (movie.cast || []).map(member => ({ ...member, imageUrl: member.imageUrl ?? '' })),
            crew: (movie.crew || []).map(member => ({ ...member, imageUrl: member.imageUrl ?? '' })),
        }));

        const movies = await Movie.create(normalizedMovies);
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
