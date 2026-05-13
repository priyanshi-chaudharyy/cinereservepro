import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Movie title is required'],
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    genre: [{
        type: String,
        enum: ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary', 'Animation', 'Adventure']
    }],
    language: [{
        type: String,
        enum: ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali']
    }],
    duration: {
        type: Number,  // in min
        required: true
    },
    releasedDate: {
        type: Date,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    posterUrl: {
        type: String,
        required: true
    },
    trailerUrl: String, // YouTube url
    cast: [{
        name: String,
        role: String,
        imageUrl: String
    }],
    crew: [{
        name: String,
        role: String,
        imageUrl: String
    }],
    director: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Movie', movieSchema);