import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

export default function AddShowtime() {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get('/api/auth/me');
      return res.data.data;
    },
  });
  const [theaters, setTheaters] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    movieId: '',
    theaterId: '',
    screenId: '',
    showDate: '',
    showTime: '',
    pricing: { vip: 500, premium: 350, economy: 250 },
  });

  useEffect(() => {
    if (!currentUser) return;
    const endpoint = currentUser.role === 'theater_admin' ? '/api/theaters/my-theaters' : '/api/theaters';
    api.get(endpoint)
      .then(res => setTheaters(res.data.data || []))
      .catch(() => toast.error('Failed to load theaters'));
  }, [currentUser]);

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handlePricingChange = e => setFormData(p => ({
    ...p, pricing: { ...p.pricing, [e.target.name]: Number(e.target.value) }
  }));

  const handleTheaterChange = e => {
    const theaterId = e.target.value;
    const theater = theaters.find(t => t._id === theaterId);
    setScreens(theater?.screens ?? []);
    setFormData(p => ({ ...p, theaterId, screenId: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.movieId || !formData.theaterId || !formData.screenId) {
      toast.error('Please fill all required fields'); return;
    }
    setLoading(true);
    try {
      await api.post('/api/showtimes', formData);
      toast.success('Showtime scheduled! 🕐');
      setFormData({ movieId: '', theaterId: '', screenId: '', showDate: '', showTime: '', pricing: { vip: 500, premium: 350, economy: 250 } });
      setScreens([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule showtime');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '680px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>Schedule Showtime</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Link a movie to a theater screen at a specific time.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Movie ID */}
        <div>
          <label style={labelStyle}>Movie ID *</label>
          <input className="input-base" name="movieId" placeholder="Paste the MongoDB ObjectId of the movie" value={formData.movieId} onChange={handleChange} required />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Tip: Copy this from MongoDB Atlas or the network tab after creating a movie.</p>
        </div>

        {/* Theater */}
        <div>
          <label style={labelStyle}>Theater *</label>
          <select className="input-base" value={formData.theaterId} onChange={handleTheaterChange} required>
            <option value="">Select a theater...</option>
            {theaters.map(t => <option key={t._id} value={t._id}>{t.name} — {t.location?.city}</option>)}
          </select>
        </div>

        {/* Screen */}
        <div>
          <label style={labelStyle}>Screen *</label>
          <select className="input-base" name="screenId" value={formData.screenId} onChange={handleChange} required disabled={screens.length === 0}>
            <option value="">
              {screens.length === 0 ? (formData.theaterId ? 'No screens found for this theater' : 'Select a theater first') : 'Select a screen...'}
            </option>
            {screens.map(s => (
              <option key={s._id} value={s._id}>
                {s.screenName || `Screen ${s.screenNumber}`} — {s.totalSeats} seats
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Show Date *</label>
            <input className="input-base" name="showDate" type="date" value={formData.showDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label style={labelStyle}>Show Time *</label>
            <input className="input-base" name="showTime" type="time" value={formData.showTime} onChange={handleChange} required />
          </div>
        </div>

        {/* Pricing */}
        <div>
          <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Seat Pricing (₹)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[
              { key: 'vip', label: 'VIP', color: 'var(--red-bright)', icon: '👑' },
              { key: 'premium', label: 'Premium', color: 'var(--red-light)', icon: '⭐' },
              { key: 'economy', label: 'Economy', color: 'var(--text-secondary)', icon: '💺' },
            ].map(({ key, label, color, icon }) => (
              <div key={key} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{icon}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color, marginBottom: '0.5rem', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>₹</span>
                  <input
                    type="number"
                    name={key}
                    value={formData.pricing[key]}
                    onChange={handlePricingChange}
                    style={{ width: '100%', background: 'transparent', border: 'none', color, fontFamily: 'var(--font-main)', fontSize: '1rem', fontWeight: 700, outline: 'none', textAlign: 'center' }}
                    min={0}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '⏳ Scheduling...' : '🕐 Schedule Showtime'}
        </button>
      </form>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' };