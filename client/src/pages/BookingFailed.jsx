import { useLocation, Link, useNavigate } from 'react-router-dom';

export default function BookingFailed() {
    const location = useLocation();
    const navigate = useNavigate();
    const message = location.state?.message || "Something went wrong with your booking.";
    const showtimeId = location.state?.showtimeId;

    return (
        <div style={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'radial-gradient(ellipse at center, #1a0508 0%, var(--bg-base) 70%)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '480px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-red)',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem 2rem',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(229, 9, 20, 0.1)',
            }}>
                {/* Premium SVG Icon instead of Emojis */}
                <div style={{ 
                    marginBottom: '1.5rem',
                    animation: 'shake 0.5s ease-in-out',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <svg 
                        width="80" height="80" viewBox="0 0 24 24" 
                        fill="none" stroke="var(--red-bright)" 
                        strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ filter: 'drop-shadow(0 0 16px rgba(229, 9, 20, 0.4))' }}
                    >
                        <circle cx="12" cy="12" r="10" fill="rgba(229, 9, 20, 0.1)"></circle>
                        <path d="M15 9l-6 6"></path>
                        <path d="M9 9l6 6"></path>
                    </svg>
                </div>
                
                <h1 style={{ 
                    fontSize: '1.8rem', 
                    marginBottom: '1rem',
                    color: 'var(--text-primary)'
                }}>
                    Booking Failed
                </h1>
                
                {/* The error message passed from the backend (our custom double-booking message) */}
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px dashed rgba(239, 68, 68, 0.4)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '2rem',
                }}>
                    <p style={{ 
                        color: 'var(--red-light)', 
                        fontSize: '1rem', 
                        lineHeight: '1.5',
                        fontWeight: 500
                    }}>
                        {message}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {showtimeId ? (
                        <button 
                            onClick={() => navigate(`/booking/${showtimeId}`)}
                            className="btn-primary" 
                            style={{ padding: '0.8rem' }}
                        >
                            Try Again for this Showtime
                        </button>
                    ) : null}
                    
                    <button 
                        onClick={() => navigate('/')}
                        style={{
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                            padding: '0.8rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                    >
                        Browse Other Movies 
                    </button>
                </div>
            </div>
            
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-5px); }
                    40%, 80% { transform: translateX(5px); }
                }
            `}</style>
        </div>
    );
}
