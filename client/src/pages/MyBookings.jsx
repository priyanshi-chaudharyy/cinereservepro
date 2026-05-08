import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function MyBookings() {
    const navigate = useNavigate();

    const { data: bookings, isLoading, error } = useQuery({
        queryKey: ['myBookings'],
        queryFn: async () => {
            const res = await bookingAPI.getMyBookings();
            return res.data.data;
        },
    });

    if (isLoading) return (
        <div className="container section" style={{ padding: '3rem 0' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>🎟 My Bookings</h1>
            {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: '120px', marginBottom: '1rem', borderRadius: 'var(--radius-md)' }} />
            ))}
        </div>
    );

    if (error) return (
        <div className="container section" style={{ textAlign: 'center', color: 'var(--red-light)', padding: '5rem 0' }}>
            ⚠️ Could not load your bookings.
        </div>
    );

    return (
        <div className="container section" style={{ padding: '3rem 0' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>🎟 My Bookings</h1>

            {bookings?.length === 0 ? (
                <div style={{
                    padding: '4rem 2rem', textAlign: 'center',
                    background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border)',
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No bookings yet</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Book your first movie ticket now!</p>
                    <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '0.6rem 1.5rem' }}>
                        Browse Movies
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {bookings.map(booking => (
                        <TicketCard key={booking._id} booking={booking} onClick={() => navigate(`/booking-success/${booking._id}`)} />
                    ))}
                </div>
            )}
        </div>
    );
}

// Tier color accents for the card border
const TIER_ACCENT = {
    VIP: { border: 'rgba(255,255,255,0.15)', accent: '#fff', label: 'VIP' },
    Premium: { border: 'rgba(251,191,36,0.3)', accent: '#fbbf24', label: 'GOLD' },
    Economy: { border: 'rgba(192,192,192,0.2)', accent: '#c0c0c0', label: 'SILVER' },
};

function TicketCard({ booking, onClick }) {
    const movie = booking.movieId;
    const theater = booking.theaterId;
    const showtime = booking.showtimeId;
    const tier = booking.seatType || 'Economy';
    const colors = TIER_ACCENT[tier] || TIER_ACCENT.Economy;
    const queryClient = useQueryClient();

    const cancelMutation = useMutation({
        mutationFn: () => bookingAPI.cancelBooking(booking._id),
        onSuccess: () => {
            toast.success('Booking cancelled successfully. Refund is pending.');
            queryClient.invalidateQueries({ queryKey: ['myBookings'] });
        },
        onError: () => toast.error('Failed to cancel booking')
    });

    const handleCancel = (e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            cancelMutation.mutate();
        }
    };

    // Calculate if the showtime is in the past
    const isPast = showtime?.showDate && new Date(showtime.showDate) < new Date(new Date().setHours(0,0,0,0));
    const canCancel = booking.status === 'Confirmed' && !isPast;

    return (
        <div onClick={onClick} style={{
            background: 'var(--bg-card)',
            border: `1px solid ${colors.border}`,
            borderLeft: `3px solid ${colors.accent}`,
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            display: 'flex',
            flexWrap: 'wrap',
            cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s',
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
            {/* Left — Movie poster */}
            {movie?.posterUrl && (
                <div style={{ width: '90px', minHeight: '120px', flexShrink: 0 }}>
                    <img src={movie.posterUrl} alt={movie.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            )}

            {/* Right — Details */}
            <div style={{ flex: 1, padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '250px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{movie?.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {theater?.name} · {showtime?.showTime}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{
                            padding: '0.15rem 0.5rem', borderRadius: '3px', fontSize: '0.6rem',
                            fontWeight: 800, letterSpacing: '0.1em',
                            border: `1px solid ${colors.border}`, color: colors.accent,
                        }}>
                            {colors.label}
                        </span>
                        <span style={{
                            padding: '0.2rem 0.65rem', borderRadius: '999px',
                            fontSize: '0.68rem', fontWeight: 700,
                            background: booking.status === 'Confirmed' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: booking.status === 'Confirmed' ? '#10b981' : '#ef4444',
                            border: `1px solid ${booking.status === 'Confirmed' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        }}>
                            {booking.status}
                        </span>
                        {booking.status === 'Cancelled' && booking.refundStatus && booking.refundStatus !== 'N/A' && (
                            <span style={{
                                padding: '0.2rem 0.65rem', borderRadius: '999px',
                                fontSize: '0.68rem', fontWeight: 700,
                                background: booking.refundStatus === 'Processed' ? 'rgba(16,185,129,0.15)' : 'rgba(251,191,36,0.15)',
                                color: booking.refundStatus === 'Processed' ? '#10b981' : '#fbbf24',
                                border: `1px solid ${booking.refundStatus === 'Processed' ? 'rgba(16,185,129,0.3)' : 'rgba(251,191,36,0.3)'}`,
                            }}>
                                Refund {booking.refundStatus}
                            </span>
                        )}
                        {canCancel && (
                            <button
                                onClick={handleCancel}
                                disabled={cancelMutation.isPending}
                                style={{
                                    marginLeft: '0.5rem', padding: '0.2rem 0.65rem', borderRadius: '999px',
                                    fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
                                    background: 'transparent', color: 'var(--red-light)',
                                    border: '1px solid var(--border)',
                                }}
                            >
                                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '0.6rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                    <div>
                        <span style={{ color: 'var(--text-muted)' }}>Seats: </span>
                        <span style={{ color: colors.accent, fontWeight: 600 }}>{booking.seats.join(', ')}</span>
                    </div>
                    <div>
                        <span style={{ color: 'var(--text-muted)' }}>Amount: </span>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>₹{booking.totalAmount}</span>
                    </div>
                    <div>
                        <span style={{ color: 'var(--text-muted)' }}>Date: </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                            {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Click hint */}
                <p style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Click to view ticket →
                </p>
            </div>
        </div>
    );
}
