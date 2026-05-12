import { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieAPI } from '../services/api';
import api from '../api/axios';
import toast from 'react-hot-toast';

function StarRatingInput({ rating, setRating }) {
    return (
        <div style={{ display: 'flex', gap: '4px', margin: '0.5rem 0' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                <span
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        color: star <= rating ? '#fbbf24' : 'var(--text-muted)',
                        transition: 'color 0.2s'
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
}

export default function MovieInfo() {
    const { movieId } = useParams();
    const locationState = useLocation();
    const userLocation = locationState.state?.location;
    const [reviewRating, setReviewRating] = useState(10);
    const [reviewComment, setReviewComment] = useState('');

    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            try {
                const res = await api.get('/api/auth/me');
                return res.data.data;
            } catch {
                return null;
            }
        },
        retry: false
    });

    const { data: movie, isLoading: movieLoading } = useQuery({
        queryKey: ['movie', movieId],
        queryFn: async () => {
            const res = await movieAPI.getById(movieId);
            return res.data.data;
        },
    });

    const { data: reviews, refetch: refetchReviews } = useQuery({
        queryKey: ['reviews', movieId],
        queryFn: async () => {
            const res = await movieAPI.getReviews(movieId);
            return res.data.data;
        },
    });

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            await movieAPI.addReview(movieId, { rating: reviewRating, comment: reviewComment });
            toast.success('Review added successfully!');
            setReviewRating(10);
            setReviewComment('');
            refetchReviews();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        }
    };

    if (movieLoading) return (
        <div className="container section" style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div className="skeleton" style={{ width: '80%', height: '400px', margin: '0 auto' }} />
        </div>
    );

    if (!movie) return (
        <div className="container section" style={{ textAlign: 'center', color: 'var(--red-light)', padding: '5rem 0' }}>
            ⚠️ Movie not found.
        </div>
    );

    return (
        <div className="container section">
            {/* Hero section */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    style={{ width: '250px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{movie.title}</h1>
                        {movie.averageRating > 0 && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                padding: '0.3rem 0.8rem', background: 'rgba(251,191,36,0.15)',
                                color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)',
                                borderRadius: '999px', fontSize: '1.1rem', fontWeight: 800
                            }}>
                                ★ {movie.averageRating} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>/ 10</span>
                            </span>
                        )}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                        {movie.director && `Directed by ${movie.director} • `}
                        {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        {movie.genre?.map(g => <span key={g} className="badge badge-crimson">{g}</span>)}
                        {movie.language?.map(l => <span key={l} className="badge badge-silver">{l}</span>)}
                    </div>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem', maxWidth: '800px' }}>
                        {movie.description}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                        <Link
                            to={`/movie/${movieId}/showtimes`}
                            state={{ location: userLocation }}
                            className="btn-primary"
                            style={{ textDecoration: 'none' }}
                        >
                            View Showtimes
                        </Link>
                        {movie.trailerUrl && (
                            <a href={movie.trailerUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }}>
                                ▶ Watch Trailer
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Cast</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                        {movie.cast.map((member, index) => (
                            <div key={`${member.name}-${index}`} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.9rem', textAlign: 'center' }}>
                                <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-elevated)', marginBottom: '0.6rem' }}>
                                    {member.imageUrl ? (
                                        <img src={member.imageUrl} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Image</div>
                                    )}
                                </div>
                                <div style={{ fontWeight: 700 }}>{member.name}</div>
                                {member.role && (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{member.role}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reviews */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>Reviews</h2>
                {currentUser ? (
                    <form onSubmit={submitReview} style={{ marginBottom: '2rem' }}>
                        <StarRatingInput rating={reviewRating} setRating={setReviewRating} />
                        <textarea
                            className="input-base"
                            placeholder="Write your review..."
                            value={reviewComment}
                            onChange={e => setReviewComment(e.target.value)}
                            rows={3}
                            required
                        />
                        <button type="submit" className="btn-primary" style={{ marginTop: '0.8rem' }}>
                            Submit Review
                        </button>
                    </form>
                ) : (
                    <p style={{ color: 'var(--text-muted)' }}>Login to leave a review.</p>
                )}

                {reviews?.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No reviews yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {reviews?.map(r => (
                            <div key={r._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong>{r.userId?.name || 'Anonymous'}</strong>
                                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>★ {r.rating}</span>
                                </div>
                                <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{r.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
