import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    comment: {
        type: String,
        maxLength: 500
    }
}, {
    timestamps: true
});

// Prevent a user from submitting more than one review per movie
reviewSchema.index({ movieId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
