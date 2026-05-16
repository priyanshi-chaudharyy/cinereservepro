import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { movieAPI, theaterAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

const GENRES = ["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi", "Thriller", "Animation", "Adventure", "Documentary"];
const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Malayalam", "Kannada", "Bengali"];
const FORMATS = ["2D", "3D", "IMAX 2D", "IMAX 3D", "4DX"];

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

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [selectedFormat, setSelectedFormat] = useState(searchParams.get('format') || '');

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const res = await theaterAPI.getLocations();
      return res.data.data;
    },
    staleTime: Infinity
  });

  // Fetch movies based on all filters
  const { data: movies, isLoading } = useQuery({
    queryKey: ['movies', category, search, selectedGenre, selectedLanguage, selectedLocation, selectedFormat],
    queryFn: async () => {
      const filter = {
        search: search || undefined,
        genre: selectedGenre || undefined,
        language: selectedLanguage || undefined,
        location: selectedLocation || undefined,
        format: selectedFormat || undefined,
        isActive: true
      };

      if (category === 'trendingnow') filter.isTrending = true;
      if (category === 'nowshowing') filter.isComingSoon = false;
      if (category === 'comingsoon') filter.isComingSoon = true;

      const res = await movieAPI.getAll(filter);
      return res.data.data;
    },
    staleTime: 60_000,
  });



  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (selectedGenre) params.set('genre', selectedGenre);
    else params.delete('genre');
    
    if (selectedLanguage) params.set('language', selectedLanguage);
    else params.delete('language');
    
    if (selectedLocation) params.set('location', selectedLocation);
    else params.delete('location');

    if (selectedFormat) params.set('format', selectedFormat);
    else params.delete('format');

    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedGenre, selectedLanguage, selectedLocation, selectedFormat, searchParams, setSearchParams]);

  const clearFilters = () => { 
    setSelectedGenre(''); 
    setSelectedLanguage(''); 
    setSelectedLocation(''); 
    setSelectedFormat(''); 
    
    const params = new URLSearchParams(searchParams);
    params.delete('genre');
    params.delete('language');
    params.delete('location');
    params.delete('format');
    params.delete('search'); // allow clearing search from here too
    setSearchParams(params, { replace: true });
  };

  const hasFilters = search || selectedGenre || selectedLanguage || selectedLocation || selectedFormat;

  let displayTitle = 'All Movies';
  if (category === 'trendingnow') displayTitle = 'Trending Now';
  if (category === 'nowshowing') displayTitle = 'Now Showing';
  if (category === 'comingsoon') displayTitle = 'Coming Soon';
  if (search) displayTitle = `Search Results for "${search}"`;

  return (
    <div>
      {/* ═══════════════ PAGE HEADER & FILTERS ═══════════════ */}
      <section style={{ padding: '3rem 0 2rem', background: 'var(--bg-base)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h1 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem' }}>{displayTitle}</h1>
            
            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} style={{ ...selectStyle, borderColor: selectedLocation ? 'rgba(251,191,36,0.4)' : 'var(--border)', color: selectedLocation ? '#fbbf24' : 'var(--text-secondary)' }}>
                  <option value="">📍 Any Location</option>
                  {locations?.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              <div style={{ position: 'relative', flexShrink: 0 }}>
                <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} style={{ ...selectStyle, borderColor: selectedLanguage ? 'rgba(251,191,36,0.4)' : 'var(--border)', color: selectedLanguage ? '#fbbf24' : 'var(--text-secondary)' }}>
                  <option value="">🌐 Language</option>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div style={{ position: 'relative', flexShrink: 0 }}>
                <select value={selectedFormat} onChange={e => setSelectedFormat(e.target.value)} style={{ ...selectStyle, borderColor: selectedFormat ? 'rgba(251,191,36,0.4)' : 'var(--border)', color: selectedFormat ? '#fbbf24' : 'var(--text-secondary)' }}>
                  <option value="">🎞️ Format</option>
                  {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)} style={{ ...selectStyle, borderColor: selectedGenre ? 'rgba(251,191,36,0.4)' : 'var(--border)', color: selectedGenre ? '#fbbf24' : 'var(--text-secondary)' }}>
                  <option value="">🎭 Genre</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {hasFilters && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={clearFilters} style={{ ...chipStyle(false), color: '#fbbf24', borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.07)' }}>✕ Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════ MOVIE GRID ═══════════════ */}
      <section className="section" style={{ paddingTop: '3rem', minHeight: '50vh' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1.5rem' }}>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
            ) : movies?.length === 0 ? (
              <div style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <h3>No movies found</h3>
                <p>Try adjusting your filters or search query.</p>
              </div>
            ) : (
              movies?.map(movie => <MovieCard key={movie._id} movie={movie} selectedLocation={selectedLocation} />)
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
