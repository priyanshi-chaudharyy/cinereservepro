import { useState } from 'react';
import { theaterAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AddTheater() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        address: '',
        rows: 10,
        columns: 15,
    });

    const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!formData.name || !formData.city) {
            toast.error('Name and City are required');
            return;
        }

        setLoading(true);
        try {
            // Generate standard seat types based on rows
            const rowsCount = Number(formData.rows);
            const colsCount = Number(formData.columns);
            const totalSeats = rowsCount * colsCount;

            const allRows = Array.from({ length: rowsCount }, (_, i) => String.fromCharCode(65 + i));

            // Divide rows roughly into VIP (last 2), Premium (middle), Economy (first ones)
            const vipRows = allRows.slice(-2);
            const premiumRows = allRows.slice(Math.max(0, rowsCount - 5), Math.max(0, rowsCount - 2));
            const economyRows = allRows.slice(0, Math.max(0, rowsCount - 5));

            const payload = {
                name: formData.name,
                location: {
                    city: formData.city,
                    address: formData.address,
                },
                screens: [
                    {
                        screenNumber: 1,
                        screenName: "Screen 1",
                        totalSeats: totalSeats,
                        seatLayout: { rows: rowsCount, columns: colsCount },
                        seatType: [
                            { type: 'Economy', rows: economyRows, basePrice: 150 },
                            { type: 'Premium', rows: premiumRows, basePrice: 200 },
                            { type: 'VIP', rows: vipRows, basePrice: 350 },
                        ].filter(st => st.rows.length > 0)
                    }
                ],
                facilities: ['Parking']
            };

            await theaterAPI.create(payload);
            toast.success('Theater added successfully! 🏛️');
            setFormData({ name: '', city: '', address: '', rows: 10, columns: 15 });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add theater');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>Add New Theater</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create a basic theater so you can add showtimes to it.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Field label="Theater Name *" name="name" placeholder="e.g. PVR Cinemas" value={formData.name} onChange={handleChange} required />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="City *" name="city" placeholder="e.g. Mumbai" value={formData.city} onChange={handleChange} required />
                    <Field label="Address" name="address" placeholder="e.g. Phoenix Mall" value={formData.address} onChange={handleChange} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="Screen 1 Rows" name="rows" type="number" value={formData.rows} onChange={handleChange} required />
                    <Field label="Screen 1 Columns" name="columns" type="number" value={formData.columns} onChange={handleChange} required />
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-0.5rem' }}>
                    * This will auto-configure 1 screen. Rows are automatically split into Economy, Premium, and VIP sections based on standard patterns.
                </p>

                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem', width: 'fit-content' }}>
                    {loading ? '⏳ Adding...' : '✅ Add Theater'}
                </button>
            </form>
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' };

function Field({ label, name, type = 'text', placeholder, value, onChange, required }) {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            <input
                className="input-base"
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
            />
        </div>
    );
}
