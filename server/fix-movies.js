import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from './models/Movie.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB for fixing movies');

        const updates = [
            {
                title: 'Interstellar',
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E'
            },
            {
                title: 'Dune: Part Two',
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg',
                trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w'
            },
            {
                title: 'Deadpool & Wolverine',
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg',
                trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk'
            }
        ];

        for (let update of updates) {
            const result = await Movie.findOneAndUpdate(
                { title: { $regex: update.title, $options: 'i' } },
                { $set: { posterUrl: update.posterUrl, trailerUrl: update.trailerUrl } },
                { new: true }
            );
            if (result) {
                console.log(`Updated ${update.title}`);
            } else {
                console.log(`Movie ${update.title} not found`);
            }
        }

        console.log('Fix complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
