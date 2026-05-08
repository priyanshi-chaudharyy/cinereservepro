import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Signup() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', businessName: '' });
    const [isCinemaPartner, setIsCinemaPartner] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData };
            if (isCinemaPartner) {
                payload.role = 'theater_admin';
            } else {
                delete payload.businessName;
            }

            const res = await api.post('/api/auth/signup', payload);
            if (isCinemaPartner) {
                toast.success('Registration submitted! Awaiting admin approval.', { duration: 5000 });
                navigate('/login');
            } else {
                toast.success('Account created successfully! 🎉');
                navigate('/');
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || 'Signup failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'radial-gradient(ellipse at center, #1a0508 0%, var(--bg-base) 70%)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>Create Account</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join Cinereserve Pro today</p>
                </div>

                {/* Cinema Partner Toggle */}
                <div style={{
                    display: 'flex', borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                    border: '1px solid var(--border)', marginBottom: '1.5rem'
                }}>
                    <button type="button" onClick={() => setIsCinemaPartner(false)} style={{
                        flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
                        background: !isCinemaPartner ? 'rgba(229,9,20,0.2)' : 'transparent',
                        color: !isCinemaPartner ? '#fff' : 'var(--text-muted)',
                        borderBottom: !isCinemaPartner ? '2px solid var(--red-light)' : '2px solid transparent',
                    }}>
                        🎟 Movie Goer
                    </button>
                    <button type="button" onClick={() => setIsCinemaPartner(true)} style={{
                        flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
                        background: isCinemaPartner ? 'rgba(229,9,20,0.2)' : 'transparent',
                        color: isCinemaPartner ? '#fff' : 'var(--text-muted)',
                        borderBottom: isCinemaPartner ? '2px solid var(--red-light)' : '2px solid transparent',
                    }}>
                        🏛️ Cinema Partner
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div>
                        <label style={labelStyle}>{isCinemaPartner ? 'Contact Person Name' : 'Full Name'}</label>
                        <input
                            className="input-base"
                            type="text"
                            name="name"
                            placeholder={isCinemaPartner ? 'Manager name' : 'John Doe'}
                            value={formData.name}
                            onChange={handleChange}
                            required
                            autoComplete="name"
                        />
                    </div>

                    {isCinemaPartner && (
                        <div>
                            <label style={labelStyle}>Cinema / Business Name</label>
                            <input
                                className="input-base"
                                type="text"
                                name="businessName"
                                placeholder="PVR Cinemas"
                                value={formData.businessName}
                                onChange={handleChange}
                                required
                                autoComplete="organization"
                            />
                        </div>
                    )}

                    <div>
                        <label style={labelStyle}>Email</label>
                        <input
                            className="input-base"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Phone</label>
                        <input
                            className="input-base"
                            type="tel"
                            name="phone"
                            placeholder="9876543210"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            autoComplete="tel"
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Password</label>
                        <input
                            className="input-base"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ marginTop: '0.5rem', height: '48px', fontSize: '1rem' }}
                    >
                        {loading
                            ? '⏳ Creating account...'
                            : isCinemaPartner
                                ? 'Apply for Cinema Partner →'
                                : 'Sign Up →'
                        }
                    </button>
                </form>

                {isCinemaPartner && (
                    <p style={{ marginTop: '0.8rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Cinema partner accounts require admin approval before activation.
                    </p>
                )}

                {/* Link to Login */}
                <div style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                    fontSize: '0.88rem',
                    color: 'var(--text-muted)',
                }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--red-light)', fontWeight: 600, textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}

const labelStyle = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '0.4rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};
