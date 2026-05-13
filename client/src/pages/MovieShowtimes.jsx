import { useMemo, useState } from 'react';
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

const formatTime = (timeStr) => timeStr || '';

const getHourFromTime = (timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    const hour = Number(parts[0]);
    return Number.isNaN(hour) ? null : hour;
};

const getShowMinPrice = (pricing) => {
    if (!pricing) return 0;
    const vals = [pricing.vip, pricing.premium, pricing.economy].filter(v => typeof v === 'number');
    return vals.length ? Math.min(...vals) : 0;
};

export default function MovieShowtimes() {
    const { movieId } = useParams();
    const locationState = useLocation();
    const navigate = useNavigate();
    const userLocation = locationState.state?.location || '';

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedFormats, setSelectedFormats] = useState([]);
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [language, setLanguage] = useState('');
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

            if (language && movie?.language && !movie.language.includes(language)) return false;

            if (selectedFormats.length > 0) {
                const facilities = s.theaterId?.facilities || [];
                if (!selectedFormats.some(f => facilities.includes(f))) return false;
            }

            if (selectedTimes.length > 0) {
                const hour = getHourFromTime(s.showTime);
                if (hour === null) return false;
                const matches = selectedTimes.some(key => {
                    const range = TIME_FILTERS.find(t => t.key === key)?.range;
                    if (!range) return false;
                    const [start, end] = range;
                    const adjusted = hour < 5 ? hour + 24 : hour;
                    return adjusted >= start && adjusted < end;
                });
                if (!matches) return false;
            }

            const min = minPrice ? Number(minPrice) : null;
            const max = maxPrice ? Number(maxPrice) : null;
            const showMin = getShowMinPrice(s.pricing);
            if (min !== null && showMin < min) return false;
            if (max !== null && showMin > max) return false;

            return true;
        });
    }, [showtimes, selectedDate, userLocation, selectedFormats, selectedTimes, minPrice, maxPrice, language, movie]);

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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>{movie?.title || 'Showtimes'}</h1>
                {movie?.language?.length > 0 && (
                    <select
                        className="input-base"
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        style={{ width: '180px' }}
                    >
                        <option value="">All Languages</option>
                        {movie.language.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                )}
            </div>

            {dates.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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

            {/* Filters */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ minWidth: '200px' }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.6rem' }}>Formats</div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {FORMAT_FILTERS.map(f => (
                                <button key={f.key} onClick={() => toggleFilter(selectedFormats, f.key, setSelectedFormats)}
                                    style={{
                                        padding: '0.35rem 0.9rem', borderRadius: '999px', fontSize: '0.78rem',
                                        border: selectedFormats.includes(f.key) ? '1px solid rgba(229,9,20,0.6)' : '1px solid var(--border)',
                                        background: selectedFormats.includes(f.key) ? 'rgba(229,9,20,0.15)' : 'transparent',
                                        color: selectedFormats.includes(f.key) ? '#fff' : 'var(--text-secondary)',
                                        cursor: 'pointer'
                                    }}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ minWidth: '200px' }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.6rem' }}>Time of Day</div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {TIME_FILTERS.map(t => (
                                <button key={t.key} onClick={() => toggleFilter(selectedTimes, t.key, setSelectedTimes)}
                                    style={{
                                        padding: '0.35rem 0.9rem', borderRadius: '999px', fontSize: '0.78rem',
                                        border: selectedTimes.includes(t.key) ? '1px solid rgba(251,191,36,0.6)' : '1px solid var(--border)',
                                        background: selectedTimes.includes(t.key) ? 'rgba(251,191,36,0.12)' : 'transparent',
                                        color: selectedTimes.includes(t.key) ? '#fbbf24' : 'var(--text-secondary)',
                                        cursor: 'pointer'
                                    }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ minWidth: '200px' }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.6rem' }}>Price</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                className="input-base"
                                placeholder="Min"
                                type="number"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                style={{ width: '100%' }}
                            />
                            <input
                                className="input-base"
                                placeholder="Max"
                                type="number"
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

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
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {(theater?.facilities || []).map(f => (
                                        <span key={f} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{f}</span>
                                    ))}
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
                                            padding: '0.55rem 1rem', borderRadius: '10px', cursor: 'pointer',
                                            border: '1px solid rgba(229,9,20,0.4)', background: 'rgba(229,9,20,0.12)',
                                            color: '#fff', fontWeight: 700
                                        }}
                                    >
                                        {formatTime(s.showTime)}
                                        {hoveredShowtimeId === s._id && (
                                            <span style={{ marginLeft: '0.5rem', color: '#fbbf24', fontSize: '0.75rem' }}>
                                                ₹{getShowMinPrice(s.pricing)}
                                            </span>
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
