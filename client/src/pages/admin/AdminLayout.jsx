import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

// Links visible only to super admin
const superAdminLinks = [
    { to: '/admin', label: 'Dashboard', icon: '📊', exact: true },
    { to: '/admin/manage-movies', label: 'Manage Movies', icon: '🎬' },
    { to: '/admin/add-movie', label: 'Add Movie', icon: '➕' },
    { to: '/admin/theaters', label: 'All Theaters', icon: '🏛️' },
    { to: '/admin/manage-admins?category=partners', label: 'Cinema Partners', icon: '🏛️' },
    { to: '/admin/manage-admins?category=staff', label: 'Staff Accounts', icon: '👥' },
];

// Links visible to theater_admin
const theaterAdminLinks = [
    { to: '/admin', label: 'Dashboard', icon: '📊', exact: true },
    { to: '/admin/theaters', label: 'My Theaters', icon: '🏛️' },
    { to: '/admin/add-theater', label: 'Add Theater', icon: '➕' },
    { to: '/admin/add-showtime', label: 'Add Showtime', icon: '🕐' },
];

export default function AdminLayout() {
    const location = useLocation();

    const { data: user, isLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const res = await api.get('/api/auth/me');
            return res.data.data;
        },
    });

    if (isLoading) return <div>Loading...</div>;
    
    // Prevent non-admin roles from accessing Admin panel
    if (!user || user.role === 'user' || user.role === 'staff') {
        return <Navigate to="/" replace />;
    }

    const role = user?.role;
    const links = role === 'admin' ? superAdminLinks : theaterAdminLinks;
    const roleName = role === 'admin' ? 'Super Admin' : (user?.businessName || 'Cinema Partner');

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
            {/* Sidebar */}
            <aside style={{
                width: '240px',
                flexShrink: 0,
                background: 'var(--bg-card)',
                borderRight: '1px solid var(--border)',
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
            }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 0.75rem', marginBottom: '0.5rem' }}>
                    {role === 'admin' ? 'Admin Panel' : 'Partner Panel'}
                </p>

                {links.map(link => {
                    const active = link.exact ? location.pathname === link.to : location.pathname === link.to;
                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.65rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                textDecoration: 'none',
                                fontWeight: active ? 600 : 400,
                                color: active ? '#fff' : 'var(--text-secondary)',
                                background: active ? 'rgba(229,9,20,0.15)' : 'transparent',
                                border: active ? '1px solid rgba(229,9,20,0.3)' : '1px solid transparent',
                                transition: 'all 0.2s ease',
                                fontSize: '0.9rem',
                            }}
                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(229,9,20,0.07)'; }}
                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                        >
                            <span>{link.icon}</span>
                            {link.label}
                        </Link>
                    );
                })}



                <div style={{ marginTop: 'auto', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.25)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logged in as</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--red-light)', fontWeight: 700, marginTop: '2px' }}>{roleName}</p>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, background: 'var(--bg-base)', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
}
