import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function TheaterList() {
    const [theaters, setTheaters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await api.get('/api/auth/me');
                setUser(userRes.data.data);

                // Super admin sees all theaters, theater admin sees only theirs
                const endpoint = userRes.data.data.role === 'theater_admin'
                    ? '/api/theaters/my-theaters'
                    : '/api/theaters';
                const res = await api.get(endpoint);
                setTheaters(res.data.data);
            } catch (err) {
                toast.error('Failed to load theaters');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>
                        {user?.role === 'theater_admin' ? 'My Theaters' : 'All Theaters'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {theaters.length} theater{theaters.length !== 1 ? 's' : ''} registered
                    </p>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
            ) : theaters.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '3rem', color: 'var(--text-muted)',
                    border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)',
                }}>
                    No theaters found. Add one from the "Add Theater" page.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {theaters.map(theater => (
                        <div key={theater._id} style={{
                            padding: '1.2rem 1.5rem', borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
                                        🏛️ {theater.name}
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                                        {theater.location?.city && `${theater.location.city}, `}
                                        {theater.location?.state || 'No location set'}
                                        {theater.location?.pincode && ` — ${theater.location.pincode}`}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {/* Screen count badge */}
                                    <span style={{
                                        padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.7rem',
                                        fontWeight: 700, background: 'rgba(229,9,20,0.15)', color: 'var(--red-light)',
                                    }}>
                                        {theater.screens?.length || 0} Screen{(theater.screens?.length || 0) !== 1 ? 's' : ''}
                                    </span>
                                    {/* Active badge */}
                                    <span style={{
                                        padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.7rem',
                                        fontWeight: 700,
                                        background: theater.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                        color: theater.isActive ? '#10b981' : '#ef4444',
                                    }}>
                                        {theater.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            {/* Facilities */}
                            {theater.facilities?.length > 0 && (
                                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                                    {theater.facilities.map(f => (
                                        <span key={f} style={{
                                            padding: '0.2rem 0.5rem', borderRadius: '4px',
                                            fontSize: '0.65rem', fontWeight: 600,
                                            background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)',
                                            border: '1px solid var(--border)',
                                        }}>
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
