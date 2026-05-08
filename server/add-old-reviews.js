import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from './models/Movie.js';
import Review from './models/Review.js';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');

        // 1. Get users
        let users = await User.find({ role: 'user' }).limit(3);
        if (users.length === 0) {
            console.log("No users found to write reviews!");
            process.exit(1);
        }

        // 2. Find Dune and Interstellar
        const moviesToReview = await Movie.find({ 
            title: { $in: ['Interstellar', 'Dune: Part Two'] } 
        });

        const reviewsData = [];

        for (let movie of moviesToReview) {
            if (movie.title === 'Interstellar') {
                reviewsData.push({ movieId: movie._id, userId: users[0]._id, rating: 9, comment: 'Mind-bending sci-fi! The soundtrack is legendary.' });
                reviewsData.push({ movieId: movie._id, userId: users[1]?._id || users[0]._id, rating: 8, comment: 'Great movie, but the ending was confusing.' });
            } else if (movie.title === 'Dune: Part Two') {
                reviewsData.push({ movieId: movie._id, userId: users[0]._id, rating: 10, comment: 'Lisan al Gaib! Best cinematic experience of the year.' });
                reviewsData.push({ movieId: movie._id, userId: users[1]?._id || users[0]._id, rating: 9, comment: 'Visually stunning. Austin Butler was amazing.' });
            }
        }

        // Remove old reviews for these movies to prevent unique index collisions if they exist
        for(let movie of moviesToReview) {
            await Review.deleteMany({ movieId: movie._id });
        }

        await Review.create(reviewsData);
        console.log('Added reviews for Dune and Interstellar');

        // 3. Update movie averages
        for (let movie of moviesToReview) {
            const reviews = await Review.find({ movieId: movie._id });
            const avg = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
            await Movie.findByIdAndUpdate(movie._id, {
                averageRating: Number(avg.toFixed(1)),
                totalReviews: reviews.length
            });
        }
        console.log('Updated ratings for Dune and Interstellar');

        console.log('Seeding complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
