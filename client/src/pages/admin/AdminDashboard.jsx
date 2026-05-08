import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

/* ── Card definitions per role ── */
const superAdminCards = [
  {
    to: '/admin/add-movie',
    icon: '🎬',
    title: 'Add Movie',
    desc: 'Add new movies to the platform catalogue',
    gradient: 'linear-gradient(135deg, rgba(229,9,20,0.25), rgba(180,0,10,0.10))',
    border: 'rgba(229,9,20,0.35)',
  },
  {
    to: '/admin/add-showtime',
    icon: '🕐',
    title: 'Add Showtime',
    desc: 'Schedule showtimes for movies across theaters',
    gradient: 'linear-gradient(135deg, rgba(251,191,36,0.20), rgba(245,158,11,0.08))',
    border: 'rgba(251,191,36,0.35)',
  },
  {
    to: '/admin/add-theater',
    icon: '➕',
    title: 'Add Theater',
    desc: 'Register a new cinema hall or screen',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.20), rgba(5,150,105,0.08))',
    border: 'rgba(16,185,129,0.35)',
  },
  {
    to: '/admin/theaters',
    icon: '🏛️',
    title: 'All Theaters',
    desc: 'View and manage all registered theaters',
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.20), rgba(79,70,229,0.08))',
    border: 'rgba(99,102,241,0.35)',
  },
  {
    to: '/admin/manage-admins',
    icon: '👥',
    title: 'Cinema Partners',
    desc: 'Manage theater admin accounts & permissions',
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.20), rgba(219,39,119,0.08))',
    border: 'rgba(236,72,153,0.35)',
  },
];

const theaterAdminCards = [
  {
    to: '/admin/theaters',
    icon: '🏛️',
    title: 'My Theaters',
    desc: 'View and manage your registered theaters',
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.20), rgba(79,70,229,0.08))',
    border: 'rgba(99,102,241,0.35)',
  },
  {
    to: '/admin/add-theater',
    icon: '➕',
    title: 'Add Theater',
    desc: 'Register a new cinema hall or screen',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.20), rgba(5,150,105,0.08))',
    border: 'rgba(16,185,129,0.35)',
  },
  {
    to: '/admin/add-showtime',
    icon: '🕐',
    title: 'Add Showtime',
    desc: 'Schedule showtimes for your theaters',
    gradient: 'linear-gradient(135deg, rgba(251,191,36,0.20), rgba(245,158,11,0.08))',
    border: 'rgba(251,191,36,0.35)',
  },
];

export default function AdminDashboard() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get('/api/auth/me');
      return res.data.data;
    },
  });

  const role = user?.role;
  const cards = role === 'admin' ? superAdminCards : theaterAdminCards;
  const greeting = role === 'admin' ? 'Super Admin' : (user?.businessName || 'Cinema Partner');

  return (
    <div style={{ padding: '2.5rem 2rem 3rem' }}>

      {/* ── Welcome Banner ── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-md, 12px)',
        background: 'linear-gradient(135deg, rgba(229,9,20,0.18) 0%, rgba(140,0,6,0.10) 50%, rgba(251,191,36,0.08) 100%)',
        border: '1px solid rgba(229,9,20,0.25)',
        padding: '2rem 2.25rem',
        marginBottom: '2.5rem',
      }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute', top: '-40%', right: '-10%',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(229,9,20,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <p style={{
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'var(--red-light, #ff4d5a)',
          marginBottom: '0.5rem',
        }}>
          {role === 'admin' ? '⚙ Admin Panel' : '🏛️ Partner Panel'}
        </p>
        <h1 style={{
          fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900,
          letterSpacing: '-0.02em', lineHeight: 1.2,
          marginBottom: '0.5rem',
        }}>
          Welcome back, <span style={{
            background: 'linear-gradient(90deg, #fde68a, #f59e0b)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>{user?.name || greeting}</span>
        </h1>
        <p style={{ color: 'var(--text-secondary, #9e7a7d)', fontSize: '0.95rem', maxWidth: '500px' }}>
          {role === 'admin'
            ? 'Manage movies, theaters, showtimes, and cinema partners from one place.'
            : 'Manage your theaters and schedule showtimes for your cinema halls.'}
        </p>
      </div>

      {/* ── Quick Access Label ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '1.25rem',
      }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
          Quick Access
        </h2>
        <div style={{
          flex: 1, height: '1px',
          background: 'linear-gradient(90deg, var(--border, rgba(229,9,20,0.15)), transparent)',
        }} />
      </div>

      {/* ── Cards Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.25rem',
      }}>
        {cards.map(card => (
          <Link
            key={card.to}
            to={card.to}
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              padding: '1.5rem 1.4rem',
              borderRadius: 'var(--radius-md, 12px)',
              background: card.gradient,
              border: `1px solid ${card.border}`,
              transition: 'all 0.25s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 12px 40px ${card.border}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>{card.icon}</span>
            <span style={{
              fontSize: '1.05rem', fontWeight: 700,
              color: 'var(--text-primary, #f5e6e8)',
              letterSpacing: '-0.01em',
            }}>
              {card.title}
            </span>
            <span style={{
              fontSize: '0.82rem', color: 'var(--text-secondary, #9e7a7d)',
              lineHeight: 1.5,
            }}>
              {card.desc}
            </span>
            {/* Arrow indicator */}
            <span style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem',
              fontSize: '1.1rem', color: 'var(--text-muted, #5a3a3e)',
              transition: 'transform 0.2s',
            }}>
              →
            </span>
          </Link>
        ))}
      </div>


    </div>
  );
}
