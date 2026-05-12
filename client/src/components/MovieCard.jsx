import { Link } from 'react-router-dom';

export default function MovieCard({ movie, selectedLocation }) {
  return (
    <div className="card" style={{ cursor: 'pointer', position: 'relative' }} role="article">
      {/* Poster */}
      <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            onError={(e) => { e.currentTarget.src = `https://placehold.co/400x600/101018/e50914?text=${encodeURIComponent(movie.title)}`; e.currentTarget.onerror = null; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.45s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            loading="lazy"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', flexDirection: 'column', gap: '0.5rem' }}>
            🎬
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No poster</span>
          </div>
        )}

        {/* Gradient overlay (always visible at bottom) */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
          background: 'linear-gradient(to top, rgba(7,7,13,0.95) 0%, rgba(7,7,13,0.3) 60%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Hover overlay with Book Now */}
        <div className="movie-card-overlay" style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(7,7,13,0.65)',
          opacity: 0, transition: 'opacity 0.3s ease',
          backdropFilter: 'blur(4px)',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >
          <Link to={`/movie/${movie._id}`} state={{ location: selectedLocation }} className="btn-primary" style={{ borderRadius: '999px', padding: '0.55rem 1.4rem', fontSize: '0.85rem', textDecoration: 'none' }}>
            View Info
          </Link>
        </div>

        {/* Rating badge */}
        {(movie.averageRating > 0 || movie.rating > 0) && (
          <div style={{
            position: 'absolute', top: '0.6rem', right: '0.6rem',
            background: 'rgba(7,7,13,0.8)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(229,9,20,0.35)',
            borderRadius: '999px', padding: '3px 10px',
            fontSize: '0.73rem', fontWeight: 800, color: 'var(--red-light)',
            display: 'flex', alignItems: 'center', gap: '3px',
          }}>
            ⭐ {movie.averageRating > 0 ? movie.averageRating : movie.rating}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.85rem 0.9rem' }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.35rem' }}>
          {movie.title}
        </h3>

        {movie.duration && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            ⏱ {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
            {movie.language?.[0] && <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>· {movie.language[0]}</span>}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {(movie.genre ?? []).slice(0, 2).map(g => (
            <span key={g} className="badge badge-crimson">{g}</span>
          ))}
        </div>
      </div>
    </div>
  );
}