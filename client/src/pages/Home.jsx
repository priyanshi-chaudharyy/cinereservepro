import { useEffect, useState, useRef } from 'react';
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

function MovieCarousel({ title, movies, loading, selectedLocation }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!loading && (!movies || movies.length === 0)) return null;

  return (
    <section className="section" style={{ paddingTop: '2rem', paddingBottom: '1rem' }}>
      <div className="container" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', borderLeft: '4px solid var(--red)', paddingLeft: '0.8rem' }}>{title}</h2>
          </div>
          <Link to={`/movies?category=${title.replace(' ', '').toLowerCase()}`} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            See All <span style={{ fontSize: '1rem', color: 'var(--red-light)' }}>›</span>
          </Link>
        </div>

        {/* Left Arrow */}
        <button onClick={() => scroll('left')} style={{ position: 'absolute', left: '-20px', top: '55%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(28,28,34,0.95)', border: '1px solid var(--border)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='var(--red)'} onMouseLeave={e => e.currentTarget.style.background='rgba(28,28,34,0.95)'}>
          <span style={{ marginLeft: '-2px' }}>❮</span>
        </button>

        {/* Horizontal scroll container */}
        <div ref={scrollRef} style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'none', scrollSnapType: 'x mandatory', msOverflowStyle: 'none' }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ width: '240px', flex: '0 0 auto' }}><SkeletonCard /></div>)
          ) : (
            movies.map(movie => (
              <div key={movie._id} style={{ width: '240px', flex: '0 0 auto', scrollSnapAlign: 'start' }}>
                <MovieCard movie={movie} selectedLocation={selectedLocation} />
              </div>
            ))
          )}
        </div>

        {/* Right Arrow */}
        <button onClick={() => scroll('right')} style={{ position: 'absolute', right: '-20px', top: '55%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(28,28,34,0.95)', border: '1px solid var(--border)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='var(--red)'} onMouseLeave={e => e.currentTarget.style.background='rgba(28,28,34,0.95)'}>
          <span style={{ marginRight: '-2px' }}>❯</span>
        </button>
      </div>
    </section>
  );
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get('/api/auth/me');
      return res.data.data;
    },
    retry: false,
    staleTime: 60_000,
  });



  // Featured Movies (Ignore filters)
  const { data: featuredMovies } = useQuery({
    queryKey: ['movies', 'featured'],
    queryFn: async () => {
      const res = await movieAPI.getAll({ isFeatured: true, isActive: true });
      return res.data.data;
    },
    staleTime: 60_000,
  });

  // Trending Movies (Ignore filters)
  const { data: trendingMovies } = useQuery({
    queryKey: ['movies', 'trending'],
    queryFn: async () => {
      const res = await movieAPI.getAll({ isTrending: true, isActive: true });
      return res.data.data;
    },
    staleTime: 60_000,
  });

  // Now Showing Movies (No filters on Home page)
  const { data: nowShowingMovies, isLoading: loadingNowShowing } = useQuery({
    queryKey: ['movies', 'nowShowing'],
    queryFn: async () => {
      const res = await movieAPI.getAll({
        isComingSoon: false,
        isActive: true
      });
      return res.data.data;
    },
    staleTime: 60_000,
  });

  // Coming Soon Movies (No filters on Home page)
  const { data: comingSoonMovies, isLoading: loadingComingSoon } = useQuery({
    queryKey: ['movies', 'comingSoon'],
    queryFn: async () => {
      const res = await movieAPI.getAll({
        isComingSoon: true,
        isActive: true
      });
      return res.data.data;
    },
    staleTime: 60_000,
  });



  // Auto-advance Carousel
  useEffect(() => {
    if (!featuredMovies || featuredMovies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredMovies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredMovies]);

  const isAdminUser = currentUser?.role === 'admin' || currentUser?.role === 'theater_admin';

  return (
    <div>
      {/* Container for Gradient Background (Hero + Search) */}
      <div style={{
        position: 'relative',
        background: 'var(--bg-base)',
        backgroundImage: 'radial-gradient(ellipse at 20% 10%, rgba(140,0,6,0.55) 0%, transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(90,0,3,0.35) 0%, transparent 60%)',
      }}>
        
        {/* ═══════════════ FEATURED HERO CAROUSEL ═══════════════ */}
        {featuredMovies && featuredMovies.length > 0 && (
          <section style={{ position: 'relative', height: 'calc(100vh - 75px)', minHeight: '600px', width: '100%', overflow: 'hidden', background: '#000' }}>
            {featuredMovies.map((movie, idx) => (
              <div key={movie._id} style={{
                position: 'absolute', inset: 0, opacity: currentSlide === idx ? 1 : 0, transition: 'opacity 1s ease-in-out', zIndex: currentSlide === idx ? 1 : 0
              }}>
                <div style={{ position: 'absolute', inset: 0, background: `url(${movie.posterUrl}) center 20% / cover no-repeat`, opacity: 0.35 }} />
                <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', gap: '3rem' }}>
                  <img src={movie.posterUrl} alt={movie.title} style={{ width: '250px', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 2, display: 'none' }} className="d-md-block" />
                  <div style={{ zIndex: 2, maxWidth: '600px' }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.1 }}>{movie.title}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{movie.description}</p>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <Link to={`/movie/${movie._id}`} className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
                        {movie.isComingSoon ? 'View Details' : 'Book Tickets'}
                      </Link>
                      <div style={{ color: 'var(--gold)', fontWeight: 700 }}>⭐ {movie.rating || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Carousel dots */}
            <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem', zIndex: 10 }}>
              {featuredMovies.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentSlide(idx)} style={{ width: '10px', height: '10px', borderRadius: '50%', background: currentSlide === idx ? 'var(--red)' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
            {/* Bottom fade */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px', background: 'linear-gradient(to bottom, transparent, var(--bg-base))', zIndex: 5, pointerEvents: 'none' }} />
          </section>
        )}
      </div> {/* End of Gradient Background */}

      {/* ═══════════════ ADMIN QUICK-ACCESS ═══════════════ */}
      {isAdminUser && (
        <div style={{ position: 'relative', zIndex: 10, padding: '0 1.5rem', marginBottom: '2rem', marginTop: '2rem' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Link to="/admin" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem',
              borderRadius: '999px', background: 'rgba(20, 5, 8, 0.75)', border: '1px solid rgba(229,9,20,0.3)',
              textDecoration: 'none', transition: 'all 0.3s', cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(229,9,20,0.6)'; e.currentTarget.style.background = 'rgba(30, 8, 12, 0.85)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(229,9,20,0.3)'; e.currentTarget.style.background = 'rgba(20, 5, 8, 0.75)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #e50914 0%, #b81d24 100%)', color: 'white', fontSize: '1.1rem' }}>
                  {currentUser?.role === 'admin' ? '⚙' : '🏛️'}
                </div>
                <div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.1rem' }}>
                    {currentUser?.role === 'admin' ? 'Super Admin Dashboard' : 'Partner Dashboard'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                    {currentUser?.role === 'admin' ? 'Manage platform data' : 'Manage theaters & showtimes'}
                  </p>
                </div>
              </div>
              <div style={{ color: 'var(--red-light)', fontSize: '0.85rem', fontWeight: 600 }}>Enter Panel →</div>
            </Link>
          </div>
        </div>
      )}

      {/* ═══════════════ MOVIE SECTIONS ═══════════════ */}
      {trendingMovies && trendingMovies.length > 0 && (
        <MovieCarousel title="Trending Now" movies={trendingMovies} />
      )}

      <MovieCarousel title="Now Showing" movies={nowShowingMovies} loading={loadingNowShowing} />
      <MovieCarousel title="Coming Soon" movies={comingSoonMovies} loading={loadingComingSoon} />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        /* Hide scrollbar for Chrome, Safari and Opera */
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}