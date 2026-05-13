import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/auth/login', formData);
            const { role } = res.data.data;
            if (res.data.token) sessionStorage.setItem('token', res.data.token);
            toast.success(`Welcome back! 👋`);
            const redirectTo = sessionStorage.getItem('redirectTo');
            if (role === 'admin') {
                navigate('/admin/add-movie');
            } else if (redirectTo) {
                sessionStorage.removeItem('redirectTo');
                navigate(redirectTo);
            } else {
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };


    const handleGoogleLogin = async () => {
        try {
            // This opens the Google popup
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // We need to send this data to our backend to create/login the user
            const userData = {
                name: user.displayName,
                email: user.email,
                profilePicture: user.photoURL,
                isGoogleAuth: true // Tell backend this is a Google login
            };
            // Send to our new backend route (we will create this in Step 5!)
            const res = await api.post('/api/auth/google', userData);
            const { role } = res.data.data;
            if (res.data.token) sessionStorage.setItem('token', res.data.token);

            toast.success(`Welcome ${user.displayName}!`);

            const redirectTo = sessionStorage.getItem('redirectTo');
            if (role === 'admin') {
                navigate('/admin/add-movie');
            } else if (redirectTo) {
                sessionStorage.removeItem('redirectTo');
                navigate(redirectTo);
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error("Google Login Error:", error);
            toast.error("Failed to login with Google");
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
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={labelStyle}>Password</label>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="input-base"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '0.8rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    padding: '0.2rem'
                                }}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ marginTop: '0.5rem', height: '48px', fontSize: '1rem' }}
                    >
                        {loading ? '⏳ Signing in...' : 'Sign In →'}
                    </button>
                </form>

                {/* Admin hint */}
                <div style={{
                    marginTop: '1.5rem',
                    padding: '0.85rem',
                    background: 'rgba(229,9,20,0.06)',
                    border: '1px solid rgba(229,9,20,0.2)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                }}>
                    <span style={{ color: 'var(--red-light)' }}>⚙ Admin?</span> Use{' '}
                    <code style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>admin@cinereserve.com</code>
                    {' '}/ <code style={{ color: 'var(--text-secondary)' }}>admin123</code>
                </div>

                {/* Sign Up link */}
                <div style={{
                    marginTop: '1.25rem',
                    textAlign: 'center',
                    fontSize: '0.88rem',
                    color: 'var(--text-muted)',
                }}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: 'var(--red-light)', fontWeight: 600, textDecoration: 'none' }}>
                        Sign Up
                    </Link>
                </div>
                <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--text-muted)' }}>
                    OR
                </div>
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    style={{
                        width: '100%',
                        padding: '0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        background: 'white',
                        color: '#333',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
                    Continue with Google
                </button>
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
