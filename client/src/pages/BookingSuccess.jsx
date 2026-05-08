import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookingAPI } from '../services/api';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

// Color themes per seat type
const THEMES = {
    VIP: {
        bg: '#050505', // Deep solid black
        border: '#e6c27a', // Brighter Gold
        accent: '#e6c27a', // Brighter Gold
        textStroke: '#e6c27a', // Brighter Gold stroke
        textFill: 'transparent',
        strip: '#050505', // Solid black film strip
        text: '#ffffff',
        muted: '#cccccc',
        label: 'VIP',
    },
    Premium: {
        bg: 'linear-gradient(135deg, #d4af37, #fff4cc, #c59b27, #ffedb3, #b8860b)', // Brighter, more vibrant Gold gradient
        border: '#0a0a0a', // Black borders
        accent: '#0a0a0a', // Black accents
        textStroke: 'transparent',
        textFill: '#0a0a0a', // Solid black TICKET text
        strip: '#d4af37', // Gold film strip matching gradient
        text: '#0a0a0a',
        muted: '#333333',
        label: 'GOLD',
    },
    Economy: {
        bg: 'linear-gradient(135deg, #8c8c8c, #c9c9c9, #737373, #b3b3b3, #595959)', // Darker, sleeker Silver/Grey gradient
        border: '#0a0a0a', // Black borders
        accent: '#0a0a0a', // Black accents
        textStroke: 'transparent',
        textFill: '#0a0a0a', // Solid black TICKET text
        strip: '#8c8c8c', // Darker Grey film strip
        text: '#0a0a0a',
        muted: '#333333',
        label: 'SILVER',
    },
};

export default function BookingSuccess() {
    const { bookingId } = useParams();

    const { data: booking, isLoading, error } = useQuery({
        queryKey: ['booking', bookingId],
        queryFn: async () => {
            const res = await bookingAPI.getById(bookingId);
            return res.data.data;
        },
    });

    if (isLoading) return (
        <div className="container section" style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div className="skeleton" style={{ width: '700px', height: '280px', margin: '0 auto', borderRadius: '12px' }} />
        </div>
    );

    if (error) return (
        <div className="container section" style={{ textAlign: 'center', color: 'var(--red-light)', padding: '5rem 0' }}>
            ⚠️ Could not load booking details.
        </div>
    );

    const movie = booking.movieId;
    const theater = booking.theaterId;
    const showtime = booking.showtimeId;
    const tier = booking.seatType || 'Economy';
    const theme = THEMES[tier] || THEMES.Economy;

    // QR code with booking details
    const qrData = encodeURIComponent(`CINERESERVE-PRO|${booking._id}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrData}&bgcolor=ebeae1&color=111111&format=svg`;

    const formattedDate = new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '/');

    const downloadTicketPDF = async () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [220, 95] });
        const gold = [230, 194, 122]; const white = [255, 255, 255];
        const muted = [150, 150, 150]; const dark = [15, 15, 15];

        // Full dark background
        doc.setFillColor(...dark);
        doc.rect(0, 0, 220, 95, 'F');

        // Top & Bottom gold borders
        doc.setFillColor(...gold);
        doc.rect(0, 0, 220, 1.5, 'F');
        doc.rect(0, 93.5, 220, 1.5, 'F');

        // Left film strip with perforations
        doc.setFillColor(25, 25, 25);
        doc.rect(0, 1.5, 10, 92, 'F');
        doc.setFillColor(0, 0, 0);
        for (let y = 6; y < 90; y += 7) { doc.roundedRect(3, y, 4.5, 4, 1, 1, 'F'); }
        doc.setDrawColor(...gold); doc.setLineWidth(0.3);
        doc.line(10, 1.5, 10, 93.5);

        // Header: CINERESERVE PRO + stars
        doc.setFont('helvetica', 'bold'); doc.setTextColor(...gold); doc.setFontSize(9);
        doc.text('CINERESERVE PRO', 15, 11);
        doc.setFontSize(5); doc.text('*  *  *  *  *', 15, 15);

        // Tier badge
        doc.setFontSize(7);
        const tierText = `${theme.label} TIER`;
        const tierW = doc.getTextWidth(tierText) + 6;
        doc.setDrawColor(...gold); doc.setLineWidth(0.4);
        doc.roundedRect(145 - tierW, 7, tierW, 6, 1, 1, 'S');
        doc.text(tierText, 145 - tierW + 3, 11);

        // Divider
        doc.setDrawColor(40, 40, 40); doc.setLineWidth(0.3);
        doc.line(15, 18, 150, 18);

        // Movie title (large)
        doc.setTextColor(...white); doc.setFontSize(20); doc.setFont('helvetica', 'bold');
        doc.text((movie?.title || 'Movie').toUpperCase(), 15, 30);

        // Info grid row 1
        const gy = 40;
        const lbl = () => { doc.setFontSize(5.5); doc.setTextColor(...muted); doc.setFont('helvetica', 'normal'); };
        const val = () => { doc.setFontSize(9); doc.setTextColor(...white); doc.setFont('helvetica', 'bold'); };

        lbl(); doc.text('DATE', 15, gy);
        val(); doc.text(formattedDate, 15, gy + 5);

        lbl(); doc.text('TIME', 50, gy);
        val(); doc.text(showtime?.showTime || '--', 50, gy + 5);

        lbl(); doc.text('THEATER', 85, gy);
        val(); doc.text((theater?.name || 'Theater').substring(0, 18), 85, gy + 5);

        lbl(); doc.text('SEAT(S)', 120, gy);
        doc.setFontSize(11); doc.setTextColor(...gold); doc.setFont('helvetica', 'bold');
        doc.text(booking.seats.join(', '), 120, gy + 5);

        // Info row 2 (Amount + Booking ID)
        doc.setDrawColor(40, 40, 40); doc.line(15, 53, 150, 53);
        lbl(); doc.text('AMOUNT PAID', 15, 56);
        doc.setFontSize(10); doc.setTextColor(16, 185, 129); doc.setFont('helvetica', 'bold');
        doc.text(`Rs. ${booking.totalAmount}`, 15, 61);

        lbl(); doc.text('BOOKING ID', 65, 56);
        doc.setFontSize(7); doc.setTextColor(...muted); doc.setFont('courier', 'normal');
        doc.text(booking._id, 65, 61);

        // Bottom tagline
        doc.setFontSize(5); doc.setTextColor(60, 60, 60); doc.setFont('helvetica', 'italic');
        doc.text('Computer-generated ticket. No signature required.', 15, 85);
        doc.setFont('helvetica', 'bold'); doc.setTextColor(...gold);
        doc.text('www.cinereservepro.com', 15, 89);

        // Vertical tear line
        doc.setDrawColor(...gold); doc.setLineDashPattern([2, 2], 0); doc.setLineWidth(0.4);
        doc.line(155, 5, 155, 90);
        doc.setLineDashPattern([], 0);

        // Right stub background
        doc.setFillColor(20, 20, 20);
        doc.rect(155, 1.5, 65, 92, 'F');

        // ADMIT X
        doc.setFont('helvetica', 'bold'); doc.setTextColor(...gold); doc.setFontSize(11);
        doc.text(`ADMIT ${booking.seats.length}`, 187, 15, { align: 'center' });
        doc.setDrawColor(50, 50, 50); doc.setLineWidth(0.3);
        doc.line(162, 18, 212, 18);

        // QR Code
        const qrDataUrl = await QRCode.toDataURL(`CINERESERVE-PRO|${booking._id}`, {
            width: 300, margin: 1, color: { dark: '#111111', light: '#ebeae1' }
        });
        doc.addImage(qrDataUrl, 'PNG', 168, 22, 38, 38);

        // Sub-QR text
        doc.setFontSize(5.5); doc.setTextColor(...muted);
        doc.text('SCAN TO VERIFY', 187, 66, { align: 'center' });
        doc.setFontSize(6); doc.setTextColor(...gold);
        doc.text(booking.seats.join(', '), 187, 75, { align: 'center' });
        doc.setTextColor(...muted); doc.setFontSize(5);
        doc.text(formattedDate, 187, 80, { align: 'center' });

        doc.save(`CineReserve_${(movie?.title || 'Ticket').replace(/\s+/g, '_')}_${booking._id.slice(-6)}.pdf`);
    };

    const addToGoogleCalendar = () => {
        const showDate = new Date(showtime?.showDate || booking.createdAt);
        const [time, period] = (showtime?.showTime || '12:00 PM').split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        const startDate = new Date(showDate);
        startDate.setHours(hours, minutes, 0);

        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 3);

        const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0];

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: `🎬 ${movie?.title} — CineReserve Pro`,
            dates: `${fmt(startDate)}/${fmt(endDate)}`,
            details: `Seats: ${booking.seats.join(', ')}\nTheater: ${theater?.name}\nTier: ${theme.label}\nBooking ID: ${booking._id}\n\nEnjoy the show! 🍿`,
            location: theater?.name || 'Cinema',
        });

        window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
    };

    return (
        <div className="container section" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem 5rem',
        }}>

            {/* ✅ Success Header */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{
                    width: '60px', height: '60px', margin: '0 auto 1rem',
                    borderRadius: '50%', background: '#10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem', color: '#fff', boxShadow: '0 0 25px rgba(16,185,129,0.4)',
                }}>✓</div>
                <h1 style={{ fontSize: '1.6rem', color: '#10b981', marginBottom: '0.3rem' }}>Booking Confirmed!</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your tickets are ready. Scroll down to view.</p>
            </div>

            {/* 🎟 HORIZONTAL TICKET */}
            <div style={{
                display: 'flex',
                width: '100%', maxWidth: '750px',
                minHeight: '280px',
                filter: 'drop-shadow(0px 15px 35px rgba(0,0,0,0.5))',
                fontFamily: "'Inter', sans-serif",
                margin: '0 auto'
            }}>

                {/* LEFT MAIN TICKET */}
                <div style={{
                    flex: '1',
                    background: theme.bg,
                    borderRadius: '12px 0 0 12px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '2rem 3rem 2rem 4rem', // extra left padding for film strip
                    border: `2px solid ${theme.border}`,
                    borderRight: 'none',
                    overflow: 'hidden'
                }}>
                    {/* Left Film Strip */}
                    <FilmStrip color={theme.strip} align="left" border={theme.border} />
                    {/* Right Film Strip */}
                    <FilmStrip color={theme.strip} align="right" border={theme.border} />

                    {/* Top Header: Reel Logo + Stars */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Masked Reel Logo for perfect transparency */}
                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <mask id={`reel-mask-${bookingId}`}>
                                        {/* Everything white stays, black is cut out */}
                                        <rect width="32" height="32" fill="white" />

                                        {/* 6 large circular cutouts */}
                                        <g fill="black">
                                            <circle cx="15" cy="6" r="3.2" />
                                            <circle cx="15" cy="6" r="3.2" transform="rotate(60 15 14)" />
                                            <circle cx="15" cy="6" r="3.2" transform="rotate(120 15 14)" />
                                            <circle cx="15" cy="6" r="3.2" transform="rotate(180 15 14)" />
                                            <circle cx="15" cy="6" r="3.2" transform="rotate(240 15 14)" />
                                            <circle cx="15" cy="6" r="3.2" transform="rotate(300 15 14)" />
                                        </g>

                                        {/* Center dot cluster (1 center + 6 surrounding mini dots) */}
                                        <circle cx="15" cy="14" r="1.5" fill="black" />
                                        <g fill="black">
                                            <circle cx="15" cy="11.2" r="0.6" />
                                            <circle cx="15" cy="11.2" r="0.6" transform="rotate(60 15 14)" />
                                            <circle cx="15" cy="11.2" r="0.6" transform="rotate(120 15 14)" />
                                            <circle cx="15" cy="11.2" r="0.6" transform="rotate(180 15 14)" />
                                            <circle cx="15" cy="11.2" r="0.6" transform="rotate(240 15 14)" />
                                            <circle cx="15" cy="11.2" r="0.6" transform="rotate(300 15 14)" />
                                        </g>
                                    </mask>
                                </defs>

                                <g mask={`url(#reel-mask-${bookingId})`}>
                                    {/* Unrolling film tail extending gently out to the right */}
                                    <path d="M 16 26.5 C 22 29 28 28 32 28 L 32 23 C 27 23 24 24 21.5 19.5 Z" fill={theme.accent} />
                                    {/* Main solid disc */}
                                    <circle cx="15" cy="14" r="13" fill={theme.accent} />
                                </g>
                            </svg>
                            <span style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.12em', color: theme.text }}>
                                CINERESERVE <span style={{ color: theme.accent, fontWeight: 900 }}>PRO</span>
                            </span>
                        </div>
                        <div style={{ color: theme.accent, fontSize: '0.8rem', letterSpacing: '2px' }}>
                            ★★★★★
                        </div>
                    </div>

                    {/* Main Title 'TICKET' */}
                    <div style={{ textAlign: 'center', margin: '0.5rem 0', position: 'relative', zIndex: 1 }}>
                        <h1 style={{
                            fontSize: '4rem', fontWeight: 900, letterSpacing: '0.2em',
                            color: theme.textFill, WebkitTextStroke: `1.5px ${theme.textStroke}`,
                            opacity: 0.95, textTransform: 'uppercase', margin: 0,
                            lineHeight: 1
                        }}>
                            TICKET
                        </h1>
                    </div>

                    {/* Movie Info Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `1px solid ${theme.border}`, paddingBottom: '0.5rem', marginBottom: '0.8rem', position: 'relative', zIndex: 1 }}>
                        <div>
                            <p style={{ color: theme.muted, fontSize: '0.65rem', letterSpacing: '0.1em', marginBottom: '0.2rem', textTransform: 'uppercase', fontWeight: 700 }}>MOVIE</p>
                            <p style={{ color: theme.text, fontSize: '1.3rem', fontWeight: 800 }}>{movie?.title}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{
                                padding: '0.25rem 0.6rem', border: `1.5px solid ${theme.border}`, borderRadius: '4px',
                                color: theme.accent, fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em'
                            }}>
                                {theme.label} TIER
                            </span>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', position: 'relative', zIndex: 1 }}>
                        <TicketField label="DATE" value={formattedDate} theme={theme} />
                        <TicketField label="TIME" value={showtime?.showTime} theme={theme} />
                        <TicketField label="THEATER" value={theater?.name?.substring(0, 15)} theme={theme} />
                        <TicketField label="SEAT" value={booking.seats.join(', ')} theme={theme} highlight />
                    </div>
                </div>

                {/* RIGHT STUB WITH QR */}
                <div style={{
                    width: '180px',
                    background: '#ebeae1', // Clean white/beige stub
                    borderRadius: '0 12px 12px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    borderLeft: `2.5px dashed ${theme.border}`, // Perforated matching line
                    borderTop: `2px solid ${theme.border}`,
                    borderRight: `2px solid ${theme.border}`,
                    borderBottom: `2px solid ${theme.border}`,
                    maskImage: 'radial-gradient(circle at right center, transparent 18px, black 19px)', // Right cutout!
                    WebkitMaskImage: 'radial-gradient(circle at right center, transparent 18px, black 19px)',
                    padding: '1.5rem',
                }}>

                    {/* ADMIT X Horizontal at top of stub */}
                    <div style={{
                        color: theme.border,
                        fontSize: '0.9rem',
                        fontWeight: 900,
                        letterSpacing: '0.2em',
                        marginBottom: '0.8rem',
                        textAlign: 'center'
                    }}>
                        ADMIT {booking.seats.length}
                    </div>

                    {/* QR Code spanning whole area */}
                    <img src={qrUrl} alt="QR Code" style={{
                        width: '100%',
                        height: 'auto',
                        maxWidth: '130px',
                        aspectRatio: '1/1',
                        mixBlendMode: 'multiply' // ensure clear contrast against background
                    }} />

                    <div style={{
                        fontSize: '0.65rem', fontWeight: 800, color: theme.border,
                        letterSpacing: '0.1em', marginTop: '0.8rem', textAlign: 'center'
                    }}>
                        SCAN VERIFY
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', width: '100%', maxWidth: '400px' }}>
                <Link to="/my-bookings" className="btn-primary" style={{
                    flex: 1, textAlign: 'center', textDecoration: 'none', padding: '0.8rem',
                    borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem'
                }}>
                    🎟 View All Bookings
                </Link>
                <Link to="/" style={{
                    flex: 1, textAlign: 'center', textDecoration: 'none', padding: '0.8rem',
                    borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                }}>
                    Home
                </Link>
                <button onClick={downloadTicketPDF} style={{
                    flex: 1, textAlign: 'center', padding: '0.8rem',
                    borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff', border: 'none', cursor: 'pointer'
                }}>
                    📥 Download PDF
                </button>
                <button onClick={addToGoogleCalendar} style={{
                    flex: 1, textAlign: 'center', padding: '0.8rem',
                    borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem',
                    background: 'transparent', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', cursor: 'pointer'
                }}>
                    📅 Add to Calendar
                </button>
            </div>

        </div>
    );
}

// Helper components
function TicketField({ label, value, theme, highlight }) {
    return (
        <div>
            <p style={{ fontSize: '0.6rem', color: theme.muted, letterSpacing: '0.1em', marginBottom: '0.15rem', fontWeight: 700 }}>{label}</p>
            <p style={{
                fontSize: highlight ? '1.1rem' : '0.9rem', fontWeight: highlight ? 900 : 700,
                color: highlight ? theme.accent : theme.text,
                letterSpacing: highlight ? '0.05em' : 'normal'
            }}>{value}</p>
        </div>
    );
}

function FilmStrip({ color, align, border }) {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            [align]: 0,
            width: '36px',
            background: color,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            padding: '16px 0',
            zIndex: 0,
            borderRight: align === 'left' ? `2px solid ${border}` : 'none',
            borderLeft: align === 'right' ? `2px solid ${border}` : 'none',
        }}>
            {[...Array(12)].map((_, i) => (
                <div key={i} style={{
                    width: '16px', height: '12px',
                    background: 'black', // deep punch holes
                    borderRadius: '2px',
                }} />
            ))}
        </div>
    );
}
