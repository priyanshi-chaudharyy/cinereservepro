import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ManageAdmins() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [pending, setPending] = useState([]);
    const [approved, setApproved] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [category, setCategory] = useState(searchParams.get('category') || 'partners');
    const [loading, setLoading] = useState(true);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const base = category === 'staff' ? '/api/admin/staff' : '/api/admin';
            const [pendingRes, approvedRes] = await Promise.all([
                api.get(`${base}/pending`),
                api.get(`${base}/approved`)
            ]);
            setPending(pendingRes.data.data);
            setApproved(approvedRes.data.data);
        } catch (err) {
            toast.error('Failed to fetch admin list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAdmins(); }, [category]);

    useEffect(() => {
        const next = searchParams.get('category') || 'partners';
        if (next !== category) setCategory(next);
    }, [searchParams, category]);

    const handleApprove = async (userId, name) => {
        try {
            const base = category === 'staff' ? '/api/admin/staff' : '/api/admin';
            await api.put(`${base}/approve/${userId}`);
            toast.success(`${name} approved!`);
            fetchAdmins();
        } catch (err) {
            toast.error('Failed to approve');
        }
    };

    const handleReject = async (userId, name) => {
        if (!window.confirm(`Reject and delete ${name}'s application?`)) return;
        try {
            const base = category === 'staff' ? '/api/admin/staff' : '/api/admin';
            await api.delete(`${base}/reject/${userId}`);
            toast.success(`${name} rejected.`);
            fetchAdmins();
        } catch (err) {
            toast.error('Failed to reject');
        }
    };

    const expectedRole = category === 'staff' ? 'staff' : 'theater_admin';
    const list = (activeTab === 'pending' ? pending : approved).filter(user => user.role === expectedRole);
    const pendingCount = pending.filter(user => user.role === expectedRole).length;
    const approvedCount = approved.filter(user => user.role === expectedRole).length;

    const title = category === 'staff' ? 'Manage Staff Accounts' : 'Manage Cinema Partners';
    const subtitle = category === 'staff'
        ? 'Approve or reject staff members who can scan tickets'
        : 'Approve or reject cinema chains that want to list on CineReserve Pro';

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{subtitle}</p>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {[{ key: 'partners', label: 'Cinema Partners' }, { key: 'staff', label: 'Staff Accounts' }].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setCategory(tab.key);
                            setSearchParams({ category: tab.key }, { replace: true });
                        }}
                        style={{
                            padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)',
                            border: category === tab.key ? '1px solid rgba(229,9,20,0.5)' : '1px solid var(--border)',
                            background: category === tab.key ? 'rgba(229,9,20,0.15)' : 'transparent',
                            color: category === tab.key ? '#fff' : 'var(--text-muted)',
                            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {['pending', 'approved'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)',
                            border: activeTab === tab ? '1px solid rgba(229,9,20,0.5)' : '1px solid var(--border)',
                            background: activeTab === tab ? 'rgba(229,9,20,0.15)' : 'transparent',
                            color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                        }}
                    >
                        {tab === 'pending' ? `Pending (${pendingCount})` : `Approved (${approvedCount})`}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
            ) : list.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '3rem', color: 'var(--text-muted)',
                    border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)',
                }}>
                    {activeTab === 'pending'
                        ? 'No pending applications 🎉'
                        : category === 'staff'
                            ? 'No approved staff yet'
                            : 'No approved cinema partners yet'}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {list.map(user => (
                        <div key={user._id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                        }}>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                                    {category === 'staff'
                                        ? `🧑‍💼 ${user.name}`
                                        : `🏛️ ${user.businessName || 'Unnamed Cinema'}`}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                    {user.name} · {user.email} · {user.phone || 'No phone'}
                                </p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                    Applied: {new Date(user.createdAt).toLocaleDateString('en-IN')}
                                </p>
                            </div>

                            {activeTab === 'pending' && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleApprove(user._id, user.businessName)}
                                        style={{
                                            padding: '0.5rem 1rem', borderRadius: '6px', border: 'none',
                                            background: 'rgba(16,185,129,0.2)', color: '#10b981',
                                            fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                                        }}
                                    >
                                        ✅ Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(user._id, user.businessName)}
                                        style={{
                                            padding: '0.5rem 1rem', borderRadius: '6px', border: 'none',
                                            background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                                            fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                                        }}
                                    >
                                        ❌ Reject
                                    </button>
                                </div>
                            )}

                            {activeTab === 'approved' && (
                                <span style={{
                                    padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.7rem',
                                    fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#10b981',
                                }}>
                                    Active
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
