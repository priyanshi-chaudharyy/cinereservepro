import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

/* Film Reel SVG icon — Exact match to reference */
function ReelIcon({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="reelGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Unrolling film tail extending gently out to the right */}
      <path d="M 16 26.5 C 22 29 28 28 32 28 L 32 23 C 27 23 24 24 21.5 19.5 Z" fill="url(#reelGrad)" />

      {/* Main solid disc */}
      <circle cx="15" cy="14" r="13" fill="url(#reelGrad)" />

      {/* 6 large circular cutouts */}
      <g fill="#0a0203"> {/* Dark red/maroon base color matching the theme */}
        <circle cx="15" cy="6" r="3.2" />
        <circle cx="15" cy="6" r="3.2" transform="rotate(60 15 14)" />
        <circle cx="15" cy="6" r="3.2" transform="rotate(120 15 14)" />
        <circle cx="15" cy="6" r="3.2" transform="rotate(180 15 14)" />
        <circle cx="15" cy="6" r="3.2" transform="rotate(240 15 14)" />
        <circle cx="15" cy="6" r="3.2" transform="rotate(300 15 14)" />
      </g>

      {/* Center dot cluster (1 center + 6 surrounding mini dots) */}
      <circle cx="15" cy="14" r="1.5" fill="#0a0203" />
      <g fill="#0a0203">
        <circle cx="15" cy="11.2" r="0.6" />
        <circle cx="15" cy="11.2" r="0.6" transform="rotate(60 15 14)" />
        <circle cx="15" cy="11.2" r="0.6" transform="rotate(120 15 14)" />
        <circle cx="15" cy="11.2" r="0.6" transform="rotate(180 15 14)" />
        <circle cx="15" cy="11.2" r="0.6" transform="rotate(240 15 14)" />
        <circle cx="15" cy="11.2" r="0.6" transform="rotate(300 15 14)" />
      </g>
    </svg>
  );
}

export default function Layout() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch current user on mount and when route changes (e.g., after login/signup)
  useEffect(() => {
    api.get('/api/auth/me')
      .then(res => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        transition: 'all 0.35s ease',
        background: scrolled ? 'rgba(10,2,3,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px', flexWrap: 'wrap' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ReelIcon />
            <div style={{ lineHeight: 1 }}>
              <span style={{
                display: 'block',
                fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.04em',
                background: 'linear-gradient(90deg, #fde68a 0%, #fbbf24 60%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                CINERESERVE
              </span>
              <span style={{ display: 'block', fontSize: '0.58rem', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.3em' }}>
                P R O
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <NavPill to="/" label="Home" active={location.pathname === '/'} />

            {authChecked && user ? (
              <>

                {/* Admin/Partner panel link */}
                {user.role === 'admin' && (
                  <NavPill to="/admin" label="⚙ Admin" active={isAdmin} accent />
                )}
                {user.role === 'theater_admin' && (
                  <NavPill to="/admin" label="🏛️ Partner Panel" active={isAdmin} accent />
                )}

                {/* User profile pill with hover dropdown */}
                <div style={{ position: 'relative' }}
                  onMouseEnter={e => e.currentTarget.querySelector('.profile-dropdown').style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.querySelector('.profile-dropdown').style.opacity = '0'}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '0.35rem 0.6rem 0.35rem 0.4rem',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}>
                    {/* Avatar circle */}
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #e50914, #b20710)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 800, color: '#fff',
                      textTransform: 'uppercase', flexShrink: 0,
                    }}>
                      {user.name?.charAt(0)}
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: '2px' }}>▼</span>
                  </div>

                  {/* Dropdown */}
                  <div className="profile-dropdown" style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '6px',
                    background: 'rgba(15,3,5,0.97)', backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '0.4rem',
                    minWidth: '160px', opacity: 0, transition: 'opacity 0.2s ease',
                    pointerEvents: 'auto', zIndex: 200,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                  >
                    {user.role === 'user' && (
                      <>
                        <button onClick={() => navigate('/my-bookings')} style={dropdownItemStyle}>
                          🎟 My Bookings
                        </button>
                        <div style={{ borderTop: '1px solid var(--border)', margin: '0.25rem 0' }} />
                      </>
                    )}
                    <button onClick={handleLogout} style={{ ...dropdownItemStyle, color: 'var(--red-light)' }}>
                      ↪ Logout
                    </button>
                  </div>
                </div>
              </>
            ) : authChecked ? (
              <NavPill to="/login" label="Sign In" active={location.pathname === '/login'} />
            ) : null}
          </nav>
        </div>
      </header>

      <main><Outlet /></main>

      <footer style={{ borderTop: '1px solid rgba(229,9,20,0.15)', padding: '2rem 0', marginTop: '4rem' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ReelIcon />
            <span style={{ fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(90deg, #fde68a, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              CINERESERVE PRO
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>The premium way to reserve your cinema seat. © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

function NavPill({ to, label, active, accent }) {
  return (
    <Link to={to} style={{
      padding: '0.42rem 1.1rem',
      borderRadius: '999px',
      fontSize: '0.875rem',
      fontWeight: active ? 700 : 400,
      color: active ? '#fff' : 'var(--text-secondary)',
      textDecoration: 'none',
      background: accent
        ? (active ? 'rgba(229,9,20,0.25)' : 'rgba(229,9,20,0.1)')
        : (active ? 'rgba(255,255,255,0.1)' : 'transparent'),
      border: accent
        ? '1px solid rgba(229,9,20,0.45)'
        : (active ? '1px solid var(--border-hover)' : '1px solid transparent'),
      transition: 'all 0.2s ease',
    }}>
      {label}
    </Link>
  );
}

const dropdownItemStyle = {
  display: 'block', width: '100%', textAlign: 'left',
  padding: '0.55rem 0.75rem', borderRadius: '4px', cursor: 'pointer',
  background: 'transparent', border: 'none',
  color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500,
  transition: 'background 0.15s',
};