import { useState, useRef, useEffect } from 'react';

const TYPE_COLORS = {
    VIP: 'var(--red-bright)',
    Premium: 'var(--red-light)',
    Economy: 'var(--text-secondary)',
};

export default function SeatGrid({ seatStatus, pricing, selectedSeats, lockedSeats, onToggle }) {
    const [hoveredTier, setHoveredTier] = useState(null);
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const [scrollPos, setScrollPos] = useState({ left: 0, top: 0, widthRatio: 1, heightRatio: 1 });

    const rows = {};
    seatStatus.forEach(seat => {
        const row = seat.seatNumber.match(/^[A-Z]+/)[0];
        if (!rows[row]) rows[row] = [];
        rows[row].push(seat);
    });

    const handleScroll = () => {
        if (!containerRef.current || !contentRef.current) return;
        const { scrollLeft, scrollTop, clientWidth, clientHeight } = containerRef.current;
        const { scrollWidth, scrollHeight } = contentRef.current;
        
        setScrollPos({
            left: scrollWidth > clientWidth ? scrollLeft / (scrollWidth - clientWidth) : 0,
            top: scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0,
            widthRatio: clientWidth / scrollWidth,
            heightRatio: clientHeight / scrollHeight
        });
    };

    useEffect(() => {
        handleScroll();
        window.addEventListener('resize', handleScroll);
        return () => window.removeEventListener('resize', handleScroll);
    }, [seatStatus]);

    const showMinimap = scrollPos.widthRatio < 1 || scrollPos.heightRatio < 1;

    return (
        <div style={{ position: 'relative' }}>
            {pricing && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                    <span className="badge badge-red">VIP ₹{pricing.vip}</span>
                    <span className="badge badge-red" style={{ opacity: 0.7 }}>Premium ₹{pricing.premium}</span>
                    <span className="badge badge-silver">Economy ₹{pricing.economy}</span>
                </div>
            )}
            <div 
                ref={containerRef}
                onScroll={handleScroll}
                style={{ background: 'var(--bg-card)', padding: '2rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'auto', maxHeight: '70vh' }}
            >
                <div ref={contentRef} style={{ minWidth: 'max-content', padding: '0 1rem', paddingBottom: '2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{
                            height: '35px',
                            borderTop: '4px solid #fbbf24',
                            borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                            boxShadow: '0 -12px 35px rgba(251,191,36,0.12)',
                            opacity: 0.8,
                        }} />
                        <p style={{ marginTop: '0.6rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            screen
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'center' }}>
                        {Object.entries(rows).map(([rowLabel, seats], rowIndex, rowArray) => {
                            const currentCategory = seats[0]?.seatType;
                            const prevCategory = rowIndex > 0 ? rowArray[rowIndex - 1][1][0]?.seatType : null;
                            const isNewCategory = prevCategory && currentCategory !== prevCategory;

                            return (
                                <div key={rowLabel} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    marginTop: isNewCategory ? '1.5rem' : '0'
                                }}>
                                    <span style={{ width: '20px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem' }}>{rowLabel}</span>
                                    
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        {seats.map((seat, index) => {
                                            const isSelected = selectedSeats.includes(seat.seatNumber);
                                            const isSold = seat.status === 'Booked' || seat.status === 'Blocked';
                                            const isLocked = lockedSeats?.includes(seat.seatNumber) && !isSelected;
                                            const isDisabled = isSold || isLocked;
                                            const baseColor = TYPE_COLORS[seat.seatType] || 'var(--text-secondary)';
                                            const price = pricing?.[seat.seatType?.toLowerCase()] || 0;
                                            const isDimmed = hoveredTier && hoveredTier !== seat.seatType;
                                            const isAisle = index === Math.floor(seats.length / 2);
                                            const seatNumOnly = seat.seatNumber.replace(/^[A-Z]+/, '');

                                            let displayColor = baseColor;
                                            if (isSold) displayColor = 'var(--text-muted)';
                                            if (isLocked) displayColor = 'var(--red-bright)';
                                            if (isSelected) displayColor = '#0a0203';

                                            return (
                                                <button
                                                    key={seat.seatNumber}
                                                    disabled={isDisabled}
                                                    onClick={() => onToggle(seat)}
                                                    title={isLocked ? "Currently being booked by someone else" : `${seat.seatNumber} • ${seat.seatType} • ₹${price}`}
                                                    style={{
                                                        width: '30px', height: '30px',
                                                        borderRadius: '5px 5px 3px 3px',
                                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                        transition: 'all 0.3s ease',
                                                        fontSize: '0.65rem', fontWeight: 700,
                                                        background: isSold ? 'var(--bg-elevated)' : isLocked ? 'rgba(239, 68, 68, 0.15)' : isSelected ? '#fbbf24' : 'transparent',
                                                        color: isSold ? 'var(--text-muted)' : isLocked ? 'var(--red-bright)' : isSelected ? '#0a0203' : baseColor,
                                                        border: isSold ? '1px solid rgba(255,255,255,0.04)' : isLocked ? '1px dashed var(--red-bright)' : isSelected ? '1px solid #fbbf24' : `1px solid ${baseColor}`,
                                                        opacity: isSold ? 0.35 : isDimmed ? 0.15 : isLocked ? 0.8 : 1,
                                                        transform: isSelected ? 'scale(1.12)' : isDimmed ? 'scale(0.95)' : 'scale(1)',
                                                        boxShadow: isSelected ? '0 0 12px rgba(251,191,36,0.35)' : 'none',
                                                        marginLeft: isAisle ? '2.5rem' : '0',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                >
                                                    {seatNumOnly}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <span style={{ width: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem' }}>{rowLabel}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2.5rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                        <Legend color="var(--text-secondary)" label="Available" />
                        <Legend color='#fbbf24' label='Selected' filled />
                        <Legend color="var(--bg-elevated)" label="Sold" sold />
                        <span style={{ width: '1px', background: 'var(--border)' }} />
                        <Legend color="var(--red-bright)" label="VIP" onMouseEnter={() => setHoveredTier('VIP')} onMouseLeave={() => setHoveredTier(null)} />
                        <Legend color="var(--red-light)" label="Premium" onMouseEnter={() => setHoveredTier('Premium')} onMouseLeave={() => setHoveredTier(null)} />
                        <Legend color="var(--text-secondary)" label="Economy" onMouseEnter={() => setHoveredTier('Economy')} onMouseLeave={() => setHoveredTier(null)} />
                    </div>
                </div>
            </div>

            {showMinimap && (
                <div style={{
                    position: 'absolute',
                    top: '2rem', right: '2rem',
                    width: '120px', height: '120px',
                    background: 'rgba(10, 2, 3, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    pointerEvents: 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    zIndex: 10
                }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        {Object.entries(rows).map(([rowLabel, seats], rowIndex, rowArr) => {
                            const topPct = (rowIndex / (rowArr.length - 1 || 1)) * 100;
                            return seats.map((seat, index) => {
                                const leftPct = (index / (seats.length - 1 || 1)) * 100;
                                const isSelected = selectedSeats.includes(seat.seatNumber);
                                const isSold = seat.status === 'Booked' || seat.status === 'Blocked';
                                const color = isSelected ? '#fbbf24' : isSold ? '#333' : TYPE_COLORS[seat.seatType] || '#666';
                                return (
                                    <div key={seat.seatNumber} style={{
                                        position: 'absolute',
                                        left: `${leftPct}%`,
                                        top: `${topPct}%`,
                                        width: '4px', height: '4px',
                                        background: color,
                                        borderRadius: '50%',
                                        opacity: 0.8,
                                        transform: 'translate(-50%, -50%)'
                                    }} />
                                );
                            });
                        })}
                        <div style={{
                            position: 'absolute',
                            left: `${scrollPos.left * (1 - scrollPos.widthRatio) * 100}%`,
                            top: `${scrollPos.top * (1 - scrollPos.heightRatio) * 100}%`,
                            width: `${scrollPos.widthRatio * 100}%`,
                            height: `${scrollPos.heightRatio * 100}%`,
                            border: '1.5px solid #fbbf24',
                            background: 'rgba(251, 191, 36, 0.15)',
                            borderRadius: '2px',
                            transition: 'all 0.05s linear'
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
}

function Legend({ color, label, filled, sold, onMouseEnter, onMouseLeave }) {
    return (
        <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: onMouseEnter ? 'pointer' : 'default', padding: '4px', borderRadius: '4px', transition: 'background 0.2s' }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div style={{
                width: '16px', height: '16px', borderRadius: '3px',
                background: filled ? color : sold ? color : 'transparent',
                border: `1px solid ${sold ? 'rgba(255,255,255,0.04)' : color}`,
                opacity: sold ? 0.35 : 1,
            }} />
            <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {label}
            </span>
        </div>
    );
}