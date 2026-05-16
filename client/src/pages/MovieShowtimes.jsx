import { useMemo, useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { showtimeAPI, movieAPI } from '../services/api';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TIME_FILTERS = [
    { key: 'morning', label: 'Morning', range: [5, 12] },
    { key: 'afternoon', label: 'Afternoon', range: [12, 17] },
    { key: 'evening', label: 'Evening', range: [17, 21] },
    { key: 'night', label: 'Night', range: [21, 29] },
];

const FORMAT_FILTERS = [
    { key: 'Dolby Atmos', label: 'Dolby Atmos' },
    { key: 'IMAX', label: 'IMAX' },
    { key: '4DX', label: '4DX' },
];

const PRICE_RANGES = [
    { label: 'Any Price', min: '', max: '' },
    { label: '0 - 100', min: 0, max: 100 },
    { label: '101 - 200', min: 101, max: 200 },
    { label: '201 - 300', min: 201, max: 300 },
    { label: '301 - 500', min: 301, max: 500 },
    { label: '501+', min: 501, max: '' },
];

const formatTime = (timeStr) => timeStr || '';

const getHourFromTime = (timeStr) => {
    if (!timeStr) return null;
    const trimmed = timeStr.trim();
    const match = trimmed.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (!match) return null;
    let hour = Number(match[1]);
    if (Number.isNaN(hour)) return null;
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hour < 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    return hour;
};

const getShowMinPrice = (pricing) => {
    if (!pricing) return 0;
    const vals = [pricing.vip, pricing.premium, pricing.economy].filter(v => typeof v === 'number');
    return vals.length ? Math.min(...vals) : 0;
};

const getPricingEntries = (pricing) => {
    if (!pricing) return [];
    const mapping = [
        { key: 'economy', label: 'Economy' },
        { key: 'premium', label: 'Premium' },
        { key: 'vip', label: 'VIP' },
    ];
    return mapping
        .map(item => ({
            label: item.label,
            value: pricing[item.key]
        }))
        .filter(item => typeof item.value === 'number');
};

export default function MovieShowtimes() {
    const { movieId } = useParams();
    const locationState = useLocation();
    const navigate = useNavigate();
    const userLocation = locationState.state?.location || '';

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedFormats, setSelectedFormats] = useState([]);
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [openLanguageFilter, setOpenLanguageFilter] = useState(false);
    const [openFormatFilter, setOpenFormatFilter] = useState(false);
    const [openTimeFilter, setOpenTimeFilter] = useState(false);
    const [openPriceFilter, setOpenPriceFilter] = useState(false);

    const languageRef = useRef(null);
    const formatRef = useRef(null);
    const timeRef = useRef(null);
    const priceRef = useRef(null);

    useEffect(() => {
        const handleClick = (event) => {
            const target = event.target;
            if (languageRef.current && !languageRef.current.contains(target)) setOpenLanguageFilter(false);
            if (formatRef.current && !formatRef.current.contains(target)) setOpenFormatFilter(false);
            if (timeRef.current && !timeRef.current.contains(target)) setOpenTimeFilter(false);
            if (priceRef.current && !priceRef.current.contains(target)) setOpenPriceFilter(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);
    const [hoveredShowtimeId, setHoveredShowtimeId] = useState(null);

    const { data: movie } = useQuery({
        queryKey: ['movie', movieId],
        queryFn: async () => {
            const res = await movieAPI.getById(movieId);
            return res.data.data;
        },
    });

    const { data: showtimes, isLoading } = useQuery({
        queryKey: ['showtimes', movieId],
        queryFn: async () => {
            const res = await showtimeAPI.getAll({ movie: movieId });
            return res.data.data;
        },
    });

    const dates = useMemo(() => {
        if (!showtimes) return [];
        const dateSet = new Set();
        showtimes.forEach(s => {
            if (s.showDate) {
                dateSet.add(new Date(s.showDate).toISOString().split('T')[0]);
            }
        });
        const sorted = [...dateSet].sort();
        if (sorted.length > 0 && !selectedDate) {
            setSelectedDate(sorted[0]);
        }
        return sorted;
    }, [showtimes, selectedDate]);

    const filteredShowtimes = useMemo(() => {
        if (!showtimes) return [];

        return showtimes.filter(s => {
            if (selectedDate) {
                const showDate = s.showDate ? new Date(s.showDate).toISOString().split('T')[0] : '';
                if (showDate !== selectedDate) return false;
            }

            if (userLocation && s.theaterId?.location?.city !== userLocation) return false;

            if (selectedLanguages.length > 0) {
                if (!movie?.language || !selectedLanguages.some(l => movie.language.includes(l))) return false;
            }

            if (selectedFormats.length > 0) {
                const facilities = s.theaterId?.facilities || [];
                if (!selectedFormats.some(f => facilities.includes(f))) return false;
            }

            if (selectedTimes.length > 0) {
                const hour = getHourFromTime(s.showTime);
                if (hour === null) return false;
                const adjusted = hour < 5 ? hour + 24 : hour;
                const matches = selectedTimes.some(key => {
                    const range = TIME_FILTERS.find(t => t.key === key)?.range;
                    if (!range) return false;
                    const [start, end] = range;
                    return adjusted >= start && adjusted < end;
                });
                if (!matches) return false;
            }

            const priceValues = getPricingEntries(s.pricing).map(entry => entry.value);
            if (selectedPriceRanges.length > 0) {
                const matches = selectedPriceRanges.some(label => {
                    const rangeChoice = PRICE_RANGES.find(r => r.label === label);
                    if (!rangeChoice) return false;
                    const min = rangeChoice.min !== '' ? Number(rangeChoice.min) : null;
                    const max = rangeChoice.max !== '' ? Number(rangeChoice.max) : null;
                    return priceValues.some(value => {
                        if (typeof value !== 'number') return false;
                        if (min !== null && value < min) return false;
                        if (max !== null && value > max) return false;
                        return true;
                    });
                });
                if (!matches) return false;
            }

            return true;
        });
    }, [showtimes, selectedDate, userLocation, selectedFormats, selectedTimes, selectedPriceRanges, selectedLanguages, movie]);

    const grouped = useMemo(() => {
        const map = new Map();
        filteredShowtimes.forEach(s => {
            const id = s.theaterId?._id || 'unknown';
            if (!map.has(id)) {
                map.set(id, { theater: s.theaterId, showtimes: [] });
            }
            map.get(id).showtimes.push(s);
        });
        return [...map.values()];
    }, [filteredShowtimes]);

    const toggleFilter = (list, key, setList) => {
        setList(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    const handleBook = async (showtimeId) => {
        try {
            await api.get('/api/auth/me');
            navigate(`/booking/${showtimeId}`);
        } catch {
            sessionStorage.setItem('redirectTo', `/movie/${movieId}/showtimes`);
            toast.error('Please login to book tickets');
            navigate('/login');
        }
    };

    if (isLoading) {
        return (
            <div className="container section" style={{ textAlign: 'center', padding: '5rem 0' }}>
                <div className="skeleton" style={{ width: '80%', height: '400px', margin: '0 auto' }} />
            </div>
        );
    }

    return (
        <div className="container section">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.2rem' }}>
                <h1 style={{ fontSize: '2.4rem', margin: 0 }}>{movie?.title || 'Showtimes'}</h1>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {typeof movie?.duration === 'number' && (
                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Runtime: {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                        </span>
                    )}
                    {movie?.certification && (
                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {movie.certification}
                        </span>
                    )}
                    {movie?.language?.map(l => (
                        <span key={l} style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {l}
                        </span>
                    ))}
                    {movie?.genre?.map(g => (
                        <span key={g} style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {g}
                        </span>
                    ))}
                </div>
            </div>

            {dates.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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

                    <div style={{ flex: '1 1 520px' }}>
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'stretch' }}>
                            <div ref={languageRef} style={{ position: 'relative', flex: '1 1 140px' }}>
                                <button
                                    type="button"
                                    onClick={() => setOpenLanguageFilter(prev => !prev)}
                                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.6rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem' }}
                                >
                                    <span>{selectedLanguages.length > 0 ? `${selectedLanguages.length} selected` : 'Language'}</span>
                                    <span>▾</span>
                                </button>
                                    {openLanguageFilter && (
                                        <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'rgba(10,2,3,0.98)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.5rem', zIndex: 20 }}>
                                            {(movie?.language || []).map(l => (
                                                <label key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedLanguages.includes(l)}
                                                        onChange={() => toggleFilter(selectedLanguages, l, setSelectedLanguages)}
                                                    />
                                                    {l}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            <div ref={priceRef} style={{ position: 'relative', flex: '1 1 140px' }}>
                                <button
                                    type="button"
                                    onClick={() => setOpenPriceFilter(prev => !prev)}
                                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.6rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem' }}
                                >
                                    <span>{selectedPriceRanges.length > 0 ? `${selectedPriceRanges.length} selected` : 'Price Range'}</span>
                                    <span>▾</span>
                                </button>
                                {openPriceFilter && (
                                    <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'rgba(10,2,3,0.98)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.5rem', zIndex: 20 }}>
                                        {PRICE_RANGES.filter(r => r.label !== 'Any Price').map(range => (
                                            <label key={range.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPriceRanges.includes(range.label)}
                                                    onChange={() => toggleFilter(selectedPriceRanges, range.label, setSelectedPriceRanges)}
                                                />
                                                {range.label}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div ref={formatRef} style={{ position: 'relative', flex: '1 1 140px' }}>
                                <button
                                    type="button"
                                    onClick={() => setOpenFormatFilter(prev => !prev)}
                                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.6rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem' }}
                                >
                                    <span>{selectedFormats.length > 0 ? `${selectedFormats.length} selected` : 'Special Formats'}</span>
                                    <span>▾</span>
                                </button>
                                    {openFormatFilter && (
                                        <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'rgba(10,2,3,0.98)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.5rem', zIndex: 20 }}>
                                            {FORMAT_FILTERS.map(f => (
                                                <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFormats.includes(f.key)}
                                                        onChange={() => toggleFilter(selectedFormats, f.key, setSelectedFormats)}
                                                    />
                                                    {f.label}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            <div ref={timeRef} style={{ position: 'relative', flex: '1 1 140px' }}>
                                <button
                                    type="button"
                                    onClick={() => setOpenTimeFilter(prev => !prev)}
                                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.6rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem' }}
                                >
                                    <span>{selectedTimes.length > 0 ? `${selectedTimes.length} selected` : 'Preferred Time'}</span>
                                    <span>▾</span>
                                </button>
                                    {openTimeFilter && (
                                        <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'rgba(10,2,3,0.98)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.5rem', zIndex: 20 }}>
                                            {TIME_FILTERS.map(t => (
                                                <label key={t.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTimes.includes(t.key)}
                                                        onChange={() => toggleFilter(selectedTimes, t.key, setSelectedTimes)}
                                                    />
                                                    {t.label}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Theater groups */}
            {grouped.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No showtimes match your filters.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {grouped.map(({ theater, showtimes: list }) => (
                        <div key={theater?._id || Math.random()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.2rem' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.8rem', marginBottom: '0.75rem' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{theater?.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{theater?.location?.city}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                                {list.map(s => (
                                    <button
                                        key={s._id}
                                        onClick={() => handleBook(s._id)}
                                        onMouseEnter={() => setHoveredShowtimeId(s._id)}
                                        onMouseLeave={() => setHoveredShowtimeId(null)}
                                        style={{
                                            padding: '0.55rem 1rem', borderRadius: '10px', cursor: 'pointer', position: 'relative',
                                            border: '1px solid rgba(229,9,20,0.4)', background: 'rgba(229,9,20,0.12)',
                                            color: '#fff', fontWeight: 700
                                        }}
                                    >
                                        {formatTime(s.showTime)}
                                        {hoveredShowtimeId === s._id && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '-68px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                padding: '0.5rem 0.6rem',
                                                borderRadius: '10px',
                                                background: 'rgba(10,2,3,0.95)',
                                                border: '1px solid rgba(251,191,36,0.4)',
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.72rem',
                                                whiteSpace: 'nowrap',
                                                boxShadow: '0 10px 24px rgba(0,0,0,0.35)'
                                            }}>
                                                <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '0.3rem', textAlign: 'center' }}>
                                                    Seat Prices
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                    {getPricingEntries(s.pricing).map(entry => (
                                                        <div key={entry.label} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                            <span>{entry.label}</span>
                                                            <span style={{ color: '#fbbf24', fontWeight: 700 }}>₹{entry.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
