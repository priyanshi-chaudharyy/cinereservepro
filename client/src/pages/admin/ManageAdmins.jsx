import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ManageAdmins() {
    const [pending, setPending] = useState([]);
    const [approved, setApproved] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(true);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const [pendingRes, approvedRes] = await Promise.all([
                api.get('/api/admin/pending'),
                api.get('/api/admin/approved')
            ]);
            setPending(pendingRes.data.data);
            setApproved(approvedRes.data.data);
        } catch (err) {
            toast.error('Failed to fetch admin list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAdmins(); }, []);

    const handleApprove = async (userId, name) => {
        try {
            await api.put(`/api/admin/approve/${userId}`);
            toast.success(`${name} approved!`);
            fetchAdmins();
        } catch (err) {
            toast.error('Failed to approve');
        }
    };

    const handleReject = async (userId, name) => {
        if (!window.confirm(`Reject and delete ${name}'s application?`)) return;
        try {
            await api.delete(`/api/admin/reject/${userId}`);
            toast.success(`${name} rejected.`);
            fetchAdmins();
        } catch (err) {
            toast.error('Failed to reject');
        }
    };

    const list = activeTab === 'pending' ? pending : approved;

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>Manage Cinema Partners</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Approve or reject cinema chains that want to list on CineReserve Pro
            </p>

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
                        {tab === 'pending' ? `⏳ Pending (${pending.length})` : `✅ Approved (${approved.length})`}
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
                    {activeTab === 'pending' ? 'No pending applications 🎉' : 'No approved cinema partners yet'}
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
                                    🏛️ {user.businessName || 'Unnamed Cinema'}
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
