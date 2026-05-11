import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Showtime from '../models/Showtime.js';


// export const createMovie = async (req, res) => {
//     const result = await cloudinary.uploader.upload(req.file.path);

//     const movie = await Movie.create({
//         ...req.body,
//         poster: result.secure_url
//     });
// };


//@desc   Get all movies
//@route  GET/api/movies
//@access Public
export const getAllMovies = async (req, res) => {
    try {
        const { search, genre, language, isActive, location } = req.query;

        const filter = {};
        if (search) {
            filter.title = { $regex: search, $options: 'i' };  //i=>case-insensitive
        }
        if (genre) {
            filter.genre = { $in: genre.split(',') };
        }
        if (language) {
            filter.language = language;
        }
        if (isActive !== undefined) {
            filter.isActive = isActive == 'true';
        }
        if (location) {
            const theaters = await Theater.find({ 'location.city': { $regex: new RegExp(`^${location}$`, 'i') }, isActive: true }).select('_id');
            const theaterIds = theaters.map(t => t._id);
            const showtimes = await Showtime.find({ theaterId: { $in: theaterIds } }).select('movieId');
            const movieIds = showtimes.map(s => s.movieId);
            filter._id = { $in: movieIds };
        }

        const movies = await Movie.find(filter).sort({ createdAt: -1 });  // fetches from db and sorts createdAt :-1 -> newest first or newest to oldest

        res.json({

            success: true,
            count: movies.length,
            data: movies
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching movies',
            error: error.message
        });
    }
};

//@desc  Get single movie
//@route GET/api/movie/:id
//@access Public
export const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({  //404=>id dont exist
                success: false,
                message: 'Movie not found'
            });
        }

        res.json({
            success: true,
            data: movie
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetchig movie',
            error: error.message
        });
    }
};

//@desc Create new movie
//@route POST/api/movies
//@access Admin
export const createMovie = async (req, res) => {
    try {
        const movie = await Movie.create(req.body);

        res.status(201).json({  //201=>resource created successfully
            success: true,
            data: movie
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating movie',
            error: error.message
        });
    }
    ;
}

//@desc Update movie
//@route PUT/api/movies/:id
//@access Admin

export const updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        res.json({
            success: true,
            data: movie
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating movie',
            error: error.message
        });
    }
};

//@desc  Delete movie
//@route DELETE/api/movies/:id
//@access Admin
export const deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        res.json({
            success: true,
            message: 'Movie deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting movie',
            error: error.message
        });
    }
};

// @desc    Add review to movie
// @route   POST /api/movies/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const movieId = req.params.id;

        const { default: Review } = await import('../models/Review.js');

        const alreadyReviewed = await Review.findOne({ userId: req.user._id, movieId });
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this movie' });
        }

        const { default: Booking } = await import('../models/Booking.js');
        const hasTicket = await Booking.findOne({ userId: req.user._id, movieId, status: 'Confirmed' });
        if (!hasTicket) {
            return res.status(403).json({ success: false, message: 'Only users who have purchased a ticket can review this movie.' });
        }

        const review = await Review.create({
            movieId,
            userId: req.user._id,
            rating: Number(rating),
            comment
        });

        // Update movie rating
        const reviews = await Review.find({ movieId });
        const avg = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await Movie.findByIdAndUpdate(movieId, {
            rating: Number(avg.toFixed(1)),
            averageRating: Number(avg.toFixed(1)),
            totalReviews: reviews.length
        });

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding review', error: error.message });
    }
};

// @desc    Get movie reviews
// @route   GET /api/movies/:id/reviews
// @access  Public
export const getReviews = async (req, res) => {
    try {
        const { default: Review } = await import('../models/Review.js');
        const reviews = await Review.find({ movieId: req.params.id })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching reviews', error: error.message });
    }
};