import { useState } from 'react';
import { theaterAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AddTheater() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        address: '',
        facilities: ['Parking'],
        screens: [
            {
                screenName: 'Screen 1',
                rows: 10,
                columns: 15,
                vipPrice: 350,
                premiumPrice: 200,
                economyPrice: 150
            }
        ]
    });

    const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const updateScreen = (index, field, value) => {
        setFormData(p => {
            const screens = [...p.screens];
            screens[index] = { ...screens[index], [field]: value };
            return { ...p, screens };
        });
    };

    const addScreen = () => {
        setFormData(p => ({
            ...p,
            screens: [
                ...p.screens,
                {
                    screenName: `Screen ${p.screens.length + 1}`,
                    rows: 10,
                    columns: 15,
                    vipPrice: 350,
                    premiumPrice: 200,
                    economyPrice: 150
                }
            ]
        }));
    };

    const removeScreen = (index) => {
        setFormData(p => ({
            ...p,
            screens: p.screens.filter((_, i) => i !== index)
        }));
    };

    const toggleFacility = (facility) => {
        setFormData(p => {
            const facilities = p.facilities.includes(facility)
                ? p.facilities.filter(f => f !== facility)
                : [...p.facilities, facility];
            return { ...p, facilities };
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!formData.name || !formData.city) {
            toast.error('Name and City are required');
            return;
        }

        setLoading(true);
        try {
            const screensPayload = formData.screens.map((screen, index) => {
                const rowsCount = Number(screen.rows);
                const colsCount = Number(screen.columns);
                const totalSeats = rowsCount * colsCount;
                const allRows = Array.from({ length: rowsCount }, (_, i) => String.fromCharCode(65 + i));
                const vipRows = allRows.slice(-2);
                const premiumRows = allRows.slice(Math.max(0, rowsCount - 5), Math.max(0, rowsCount - 2));
                const economyRows = allRows.slice(0, Math.max(0, rowsCount - 5));

                return {
                    screenNumber: index + 1,
                    screenName: screen.screenName || `Screen ${index + 1}`,
                    totalSeats,
                    seatLayout: { rows: rowsCount, columns: colsCount },
                    seatType: [
                        { type: 'Economy', rows: economyRows, basePrice: Number(screen.economyPrice) || 150 },
                        { type: 'Premium', rows: premiumRows, basePrice: Number(screen.premiumPrice) || 200 },
                        { type: 'VIP', rows: vipRows, basePrice: Number(screen.vipPrice) || 350 },
                    ].filter(st => st.rows.length > 0)
                };
            });

            const payload = {
                name: formData.name,
                location: {
                    city: formData.city,
                    address: formData.address,
                },
                screens: screensPayload,
                facilities: formData.facilities
            };

            await theaterAPI.create(payload);
            toast.success('Theater added successfully! 🏛️');
            setFormData({
                name: '',
                city: '',
                address: '',
                facilities: ['Parking'],
                screens: [{ screenName: 'Screen 1', rows: 10, columns: 15, vipPrice: 350, premiumPrice: 200, economyPrice: 150 }]
            });
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

                <div>
                    <label style={labelStyle}>Facilities</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {['IMAX', '4DX', 'Dolby Atmos', 'Parking', 'Food Court', 'Wheelchair Access'].map(f => (
                            <button key={f} type="button" onClick={() => toggleFacility(f)} style={{
                                padding: '4px 10px', borderRadius: '999px', fontSize: '0.78rem',
                                border: formData.facilities.includes(f) ? '1px solid rgba(229,9,20,0.5)' : '1px solid var(--border)',
                                background: formData.facilities.includes(f) ? 'rgba(229,9,20,0.12)' : 'transparent',
                                color: formData.facilities.includes(f) ? '#fff' : 'var(--text-secondary)'
                            }}>{f}</button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <label style={labelStyle}>Screens</label>
                    <button type="button" onClick={addScreen} style={{
                        padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem',
                        border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)'
                    }}>
                        + Add Screen
                    </button>
                </div>

                {formData.screens.map((screen, index) => (
                    <div key={index} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <strong>Screen {index + 1}</strong>
                            {formData.screens.length > 1 && (
                                <button type="button" onClick={() => removeScreen(index)} style={{
                                    padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)',
                                    background: 'rgba(239,68,68,0.1)', color: '#ef4444'
                                }}>
                                    Remove
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                            <Field label="Screen Name" name="screenName" placeholder={`Screen ${index + 1}`} value={screen.screenName} onChange={e => updateScreen(index, 'screenName', e.target.value)} required />
                            <Field label="Rows" name="rows" type="number" value={screen.rows} onChange={e => updateScreen(index, 'rows', e.target.value)} required />
                            <Field label="Columns" name="columns" type="number" value={screen.columns} onChange={e => updateScreen(index, 'columns', e.target.value)} required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                            <Field label="VIP Price" name="vipPrice" type="number" value={screen.vipPrice} onChange={e => updateScreen(index, 'vipPrice', e.target.value)} required />
                            <Field label="Premium Price" name="premiumPrice" type="number" value={screen.premiumPrice} onChange={e => updateScreen(index, 'premiumPrice', e.target.value)} required />
                            <Field label="Economy Price" name="economyPrice" type="number" value={screen.economyPrice} onChange={e => updateScreen(index, 'economyPrice', e.target.value)} required />
                        </div>
                    </div>
                ))}

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
