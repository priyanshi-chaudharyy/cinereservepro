import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { movieAPI, theaterAPI } from '../services/api';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';

const GENRES = ["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi", "Thriller", "Animation", "Adventure", "Documentary"];
const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Malayalam", "Kannada", "Bengali"];

function SkeletonCard() {
  return (
    <div className="card">
      <div className="skeleton" style={{ aspectRatio: '2/3' }} />
      <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="skeleton" style={{ height: '13px', width: '80%' }} />
        <div className="skeleton" style={{ height: '11px', width: '50%' }} />
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <div className="skeleton" style={{ height: '20px', width: '52px', borderRadius: '999px' }} />
        </div>
      </div>
    </div>
  );
}

const chipStyle = (active) => ({
  whiteSpace: 'nowrap',
  padding: '0.38rem 1.05rem',
  borderRadius: '999px',
  cursor: 'pointer',
  fontFamily: 'var(--font-main)',
  fontWeight: active ? 700 : 400,
  fontSize: '0.83rem',
  transition: 'all 0.18s ease',
  background: active ? 'rgba(229,9,20,0.18)' : 'transparent',
  border: active ? '1px solid rgba(229,9,20,0.5)' : '1px solid var(--border)',
  color: active ? 'var(--red-light)' : 'var(--text-secondary)',
});

const selectStyle = {
  padding: '0.6rem 2rem 0.6rem 1rem',
  borderRadius: '999px',
  background: 'rgba(28,5,10,0.8)',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  fontFamily: 'var(--font-main)',
  fontSize: '0.85rem',
  fontWeight: 500,
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239e7a7d'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.75rem center',
};

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedGenres, setSelectedGenres] = useState(
    (searchParams.get('genres') || '')
      .split(',')
      .map(g => g.trim())
      .filter(Boolean)
  );
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get('/api/auth/me');
      return res.data.data;
    },
    retry: false,
    staleTime: 60_000,
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const res = await theaterAPI.getLocations();
      return res.data.data;
    },
    staleTime: Infinity
  });

  const { data: movies, isLoading, error } = useQuery({
    queryKey: ['movies', search, selectedGenres, selectedLanguage, selectedLocation],
    queryFn: async () => {
      const res = await movieAPI.getAll({
        search: search || undefined,
        genre: selectedGenres.length > 0 ? selectedGenres.join(',') : undefined,
        language: selectedLanguage || undefined,
        location: selectedLocation || undefined,
      });
      return res.data.data;
    },
    staleTime: 60_000,
  });

  const toggleGenre = (g) => {
    if (g === 'All') {
      setSelectedGenres([]);
      return;
    }
    setSelectedGenres(prev => 
      prev.includes(g) ? prev.filter(genre => genre !== g) : [...prev, g]
    );
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedGenres.length > 0) params.set('genres', selectedGenres.join(','));
    if (selectedLanguage) params.set('language', selectedLanguage);
    if (selectedLocation) params.set('location', selectedLocation);
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      setSearchParams(params, { replace: true });
    }
  }, [search, selectedGenres, selectedLanguage, selectedLocation, searchParams, setSearchParams]);

  const clearFilters = () => { setSearch(''); setSelectedGenres([]); setSelectedLanguage(''); setSelectedLocation(''); };
  const hasFilters = search || selectedGenres.length > 0 || selectedLanguage || selectedLocation;
  const isAdminUser = currentUser?.role === 'admin' || currentUser?.role === 'theater_admin';

  return (
    <div>
      {/* ═══════════════ HERO ═══════════════ */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-base)',
        backgroundImage: 'radial-gradient(ellipse at 20% 10%, rgba(140,0,6,0.55) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(90,0,3,0.35) 0%, transparent 50%)',
        padding: '5rem 0 3.5rem',
      }}>
        {/* Scan line texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.006) 3px, rgba(255,255,255,0.006) 4px)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>

          {/* "NOW SHOWING" badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 16px', borderRadius: '999px', background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.35)', marginBottom: '1.5rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
              <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="5" x2="8" y2="19"></line>
            </svg>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--red-light)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Now Showing</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1.25rem' }}>
            The Best Seats in the{' '}
            <span className="gradient-text">Cinema</span>
            <br />Are Waiting for You
          </h1>

          <p style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2.25rem', lineHeight: 1.75 }}>
            Browse the latest blockbusters, pick your perfect seats, and book in
            seconds — no queues, no hassle.
          </p>

          {/* ── Search bar ── */}
          <div style={{ maxWidth: '700px', margin: '0 auto 1.5rem', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '250px' }}>
              <span style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1rem', pointerEvents: 'none' }}>🔍</span>
              <input
                type="text"
                placeholder="Search movies by title..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: '999px',
                  background: 'rgba(28,5,10,0.85)',
                  border: '1px solid rgba(229,9,20,0.2)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-main)', fontSize: '0.95rem', outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  backdropFilter: 'blur(12px)',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(229,9,20,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(229,9,20,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(229,9,20,0.2)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            
            {/* Location dropdown */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                style={{ ...selectStyle, borderColor: selectedLocation ? 'rgba(251,191,36,0.4)' : 'rgba(229,9,20,0.2)', color: selectedLocation ? '#fbbf24' : 'var(--text-secondary)' }}
              >
                <option value="">📍 Any Location</option>
                {locations?.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>

            {/* Language dropdown */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                style={{ ...selectStyle, borderColor: selectedLanguage ? 'rgba(251,191,36,0.4)' : 'rgba(229,9,20,0.2)', color: selectedLanguage ? '#fbbf24' : 'var(--text-secondary)' }}
              >
                <option value="">🌐 Language</option>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* ── Genre chips ── */}
          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '700px', margin: '0 auto' }}>
            {['All', ...GENRES].map(g => (
              <button key={g} onClick={() => toggleGenre(g)}
                style={chipStyle((g === 'All' && selectedGenres.length === 0) || selectedGenres.includes(g))}>
                {g}
              </button>
            ))}
            {hasFilters && (
              <button onClick={clearFilters} style={{ ...chipStyle(false), color: '#fbbf24', borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.07)' }}>
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to bottom, transparent, var(--bg-base))', pointerEvents: 'none' }} />
      </section>

      {/* ═══════════════ ADMIN QUICK-ACCESS ═══════════════ */}
      {isAdminUser && (
        <div style={{ position: 'relative', zIndex: 10, marginTop: '-30px', marginBottom: '2rem', padding: '0 1.5rem' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Link to="/admin" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              borderRadius: '999px',
              background: 'rgba(20, 5, 8, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(229,9,20,0.3)',
              textDecoration: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(229,9,20,0.6)';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(229,9,20,0.2), inset 0 1px 1px rgba(255,255,255,0.1)';
                e.currentTarget.style.background = 'rgba(30, 8, 12, 0.85)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(229,9,20,0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)';
                e.currentTarget.style.background = 'rgba(20, 5, 8, 0.75)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e50914 0%, #b81d24 100%)',
                  color: 'white', fontSize: '1.1rem',
                  boxShadow: '0 2px 10px rgba(229,9,20,0.4)'
                }}>
                  {currentUser?.role === 'admin' ? '⚙' : '🏛️'}
                </div>
                <div>
                  <p style={{
                    fontSize: '0.95rem', fontWeight: 700,
                    color: '#fff', letterSpacing: '0.02em',
                    marginBottom: '0.1rem',
                  }}>
                    {currentUser?.role === 'admin' ? 'Super Admin Dashboard' : 'Partner Dashboard'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                    {currentUser?.role === 'admin'
                      ? 'Manage platform data'
                      : 'Manage theaters & showtimes'}
                  </p>
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                color: 'var(--red-light)', fontSize: '0.85rem', fontWeight: 600
              }}>
                Enter Panel <span style={{ fontSize: '1.2rem', transition: 'transform 0.2s' }}>→</span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ═══════════════ MOVIE GRID ═══════════════ */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.3rem' }}>
              {selectedGenres.length > 0 || selectedLanguage || selectedLocation
                ? [selectedLocation, ...selectedGenres, selectedLanguage].filter(Boolean).join(' · ')
                : 'All Movies'}
              {!isLoading && movies && (
                <span className="badge badge-silver" style={{ marginLeft: '0.6rem', verticalAlign: 'middle' }}>{movies.length}</span>
              )}
            </h2>
          </div>

          {error && (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(229,9,20,0.06)', border: '1px solid rgba(229,9,20,0.18)', borderRadius: 'var(--radius-md)', color: 'var(--red-light)', marginBottom: '2rem' }}>
              ⚠️ Could not load movies — make sure the backend server is running.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: '1.35rem' }}>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
              : movies?.length === 0
                ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No movies found</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try adjusting your filters</p>
                  </div>
                )
                : movies?.map(movie => <MovieCard key={movie._id} movie={movie} selectedLocation={selectedLocation} />)
            }
          </div>
        </div>
      </section>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}