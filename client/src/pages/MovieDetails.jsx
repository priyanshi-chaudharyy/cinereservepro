import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieAPI, showtimeAPI } from '../services/api';
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

export default function MovieDetails() {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTheater, setSelectedTheater] = useState('');
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

    const handleBookClick = async (showtimeId) => {
        try {
            await api.get('/api/auth/me');
            navigate(`/booking/${showtimeId}`);
        } catch {
            toast.error('Please login to book tickets');
            navigate('/login');
        }
    };

    const { data: movie, isLoading: movieLoading } = useQuery({
        queryKey: ['movie', movieId],
        queryFn: async () => {
            const res = await movieAPI.getById(movieId);
            return res.data.data;
        },
    });

    const { data: showtimes, isLoading: showtimesLoading } = useQuery({
        queryKey: ['showtimes', movieId],
        queryFn: async () => {
            const res = await showtimeAPI.getAll({ movie: movieId });
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

    // Extract unique dates from showtimes
    const dates = useMemo(() => {
        if (!showtimes) return [];
        const dateSet = new Set();
        showtimes.forEach(s => {
            if (s.showDate) {
                const d = new Date(s.showDate);
                dateSet.add(d.toISOString().split('T')[0]);
            }
        });
        const sorted = [...dateSet].sort();
        // Auto-select first date
        if (sorted.length > 0 && !selectedDate) {
            setSelectedDate(sorted[0]);
        }
        return sorted;
    }, [showtimes, selectedDate]);

    // Extract unique theaters from filtered showtimes
    const theaters = useMemo(() => {
        if (!showtimes) return [];
        const theaterMap = new Map();
        showtimes.forEach(s => {
            if (s.theaterId && !theaterMap.has(s.theaterId._id)) {
                theaterMap.set(s.theaterId._id, s.theaterId.name);
            }
        });
        return [...theaterMap.entries()]; // [[id, name], ...]
    }, [showtimes]);

    // Filter showtimes by selected date and theater
    const filteredShowtimes = useMemo(() => {
        if (!showtimes) return [];
        return showtimes.filter(s => {
            const matchDate = !selectedDate || (s.showDate && new Date(s.showDate).toISOString().split('T')[0] === selectedDate);
            const matchTheater = !selectedTheater || s.theaterId?._id === selectedTheater;
            return matchDate && matchTheater;
        });
    }, [showtimes, selectedDate, selectedTheater]);

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
                    {movie.trailerUrl && (
                        <a href={movie.trailerUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ display: 'inline-block', marginTop: '1.5rem', textDecoration: 'none' }}>
                            ▶ Watch Trailer
                        </a>
                    )}
                </div>
            </div>

            {/* Showtimes section */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Available Showtimes</h2>

                {/* Date Tabs */}
                {dates.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                        {dates.map(dateStr => {
                            const d = new Date(dateStr + 'T00:00:00');
                            const isActive = selectedDate === dateStr;
                            const isToday = dateStr === new Date().toISOString().split('T')[0];
                            return (
                                <button key={dateStr} onClick={() => setSelectedDate(dateStr)}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                        border: isActive ? '1px solid rgba(229,9,20,0.6)' : '1px solid var(--border)',
                                        background: isActive ? 'rgba(229,9,20,0.15)' : 'var(--bg-card)',
                                        color: isActive ? '#fff' : 'var(--text-secondary)',
                                        transition: 'all 0.2s ease', minWidth: '65px',
                                    }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: isActive ? 'var(--red-light)' : 'var(--text-muted)' }}>
                                        {isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                    <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                                        {d.getDate()}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', color: isActive ? 'var(--red-pale)' : 'var(--text-muted)' }}>
                                        {d.toLocaleDateString('en-US', { month: 'short' })}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Theater Filter */}
                {theaters.length > 1 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                        <button onClick={() => setSelectedTheater('')}
                            style={{
                                padding: '0.4rem 1rem', borderRadius: '999px', cursor: 'pointer',
                                fontSize: '0.82rem', fontWeight: !selectedTheater ? 700 : 400,
                                border: !selectedTheater ? '1px solid rgba(251,191,36,0.5)' : '1px solid var(--border)',
                                background: !selectedTheater ? 'rgba(251,191,36,0.1)' : 'transparent',
                                color: !selectedTheater ? '#fbbf24' : 'var(--text-secondary)',
                                transition: 'all 0.2s',
                            }}>
                            All Theaters
                        </button>
                        {theaters.map(([id, name]) => (
                            <button key={id} onClick={() => setSelectedTheater(id)}
                                style={{
                                    padding: '0.4rem 1rem', borderRadius: '999px', cursor: 'pointer',
                                    fontSize: '0.82rem', fontWeight: selectedTheater === id ? 700 : 400,
                                    border: selectedTheater === id ? '1px solid rgba(251,191,36,0.5)' : '1px solid var(--border)',
                                    background: selectedTheater === id ? 'rgba(251,191,36,0.1)' : 'transparent',
                                    color: selectedTheater === id ? '#fbbf24' : 'var(--text-secondary)',
                                    transition: 'all 0.2s',
                                }}>
                                {name}
                            </button>
                        ))}
                    </div>
                )}

                {showtimesLoading ? (
                    <div className="skeleton" style={{ width: '100%', height: '100px' }} />
                ) : filteredShowtimes.length > 0 ? (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {filteredShowtimes.map(showtime => (
                            <div key={showtime._id} style={{
                                background: 'var(--bg-card)',
                                padding: '1.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '1rem'
                            }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>
                                        {showtime.theaterId?.name || 'Unknown Theater'}
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        🕐 {showtime.showTime}
                                        {showtime.showDate && (
                                            <span style={{ marginLeft: '0.75rem', color: 'var(--text-secondary)' }}>
                                                📅 {new Date(showtime.showDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {showtime.pricing?.vip && <span className="badge badge-red">VIP ₹{showtime.pricing.vip}</span>}
                                        {showtime.pricing?.premium && <span className="badge badge-red" style={{ opacity: 0.7 }}>Premium ₹{showtime.pricing.premium}</span>}
                                        {showtime.pricing?.economy && <span className="badge badge-silver">Economy ₹{showtime.pricing.economy}</span>}
                                    </div>
                                    <button
                                        onClick={() => handleBookClick(showtime._id)}
                                        className="btn-primary"
                                        style={{ textDecoration: 'none', padding: '0.6rem 1.5rem', cursor: 'pointer' }}
                                    >
                                        Ticket →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            {showtimes?.length > 0 ? 'No showtimes for this date/theater combination.' : 'No showtimes currently scheduled for this movie.'}
                        </p>
                    </div>
                )}
            </div>

            {/* ═══════════════ REVIEWS SECTION ═══════════════ */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '3rem', marginTop: '3rem' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Reviews & Ratings</h2>
                
                {currentUser ? (
                    <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Leave a Review</h3>
                        <form onSubmit={submitReview}>
                            <StarRatingInput rating={reviewRating} setRating={setReviewRating} />
                            <textarea 
                                value={reviewComment}
                                onChange={e => setReviewComment(e.target.value)}
                                placeholder="What did you think of the movie? (Optional)"
                                rows={3}
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', marginTop: '0.5rem',
                                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-main)', fontSize: '0.95rem', resize: 'vertical'
                                }}
                            />
                            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '0.6rem 1.5rem' }}>
                                Submit Review
                            </button>
                        </form>
                    </div>
                ) : (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>Log in to share your thoughts on this movie.</p>
                        <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none' }}>Log In</Link>
                    </div>
                )}

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {reviews?.length > 0 ? reviews.map(review => (
                        <div key={review._id} style={{
                            background: 'var(--bg-elevated)', padding: '1.2rem 1.5rem',
                            borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #e50914, #b20710)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>
                                        {review.userId?.name?.charAt(0) || 'U'}
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{review.userId?.name || 'Anonymous User'}</span>
                                </div>
                                <span style={{ color: '#fbbf24', fontWeight: 800 }}>★ {review.rating} / 10</span>
                            </div>
                            {review.comment && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginTop: '0.8rem' }}>
                                    {review.comment}
                                </p>
                            )}
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.8rem' }}>
                                {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                    )) : (
                        <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
