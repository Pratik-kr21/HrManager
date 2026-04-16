import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { Plus, X, Calendar, Clock } from 'lucide-react';

const LEAVE_TYPES = ['Sick', 'Casual', 'Annual', 'Other'];
const badgeClass  = (s) => s === 'Approved' ? 'badge-success' : s === 'Rejected' ? 'badge-danger' : 'badge-warning';

const EmpLeaves = () => {
    const { user } = useContext(AuthContext);
    const [leaves, setLeaves]     = useState([]);
    const [empId, setEmpId]       = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading]   = useState(true);
    const [toast, setToast]       = useState(null);
    const [filter, setFilter]     = useState('All');
    const [form, setForm]         = useState({ type: 'Casual', from: '', to: '', reason: '' });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leaveRes, empRes] = await Promise.all([api.get('/leaves'), api.get('/employees')]);
            const emp = empRes.data.find(e => e.email?.toLowerCase() === user?.email?.toLowerCase());
            if (emp) {
                setEmpId(emp._id);
                const myLeaves = leaveRes.data.filter(l => l.employeeId?._id === emp._id || l.employeeId === emp._id);
                setLeaves(myLeaves);
            }
        } catch { showToast('Failed to load', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!empId) return showToast('No employee profile linked to your account', 'error');
        setSubmitting(true);
        try {
            await api.post('/leaves', { ...form, employeeId: empId });
            setShowModal(false);
            setForm({ type: 'Casual', from: '', to: '', reason: '' });
            await fetchData();
            showToast('Leave request submitted!');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed', 'error');
        } finally { setSubmitting(false); }
    };

    const daysDiff = (f, t) => Math.max(1, Math.ceil((new Date(t) - new Date(f)) / 86400000) + 1);

    const stats = {
        pending:  leaves.filter(l => l.status === 'Pending').length,
        approved: leaves.filter(l => l.status === 'Approved').length,
        rejected: leaves.filter(l => l.status === 'Rejected').length,
        totalDays: leaves.filter(l => l.status === 'Approved').reduce((s, l) => s + daysDiff(l.from, l.to), 0),
    };

    const filtered = filter === 'All' ? leaves : leaves.filter(l => l.status === filter);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {toast && (
                <div style={{ position: 'fixed', top: '20px', right: '24px', zIndex: 999, background: toast.type === 'error' ? 'var(--danger)' : 'var(--forest)', color: '#fff', padding: '12px 20px', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-lg)', fontSize: '0.88rem', fontWeight: 500 }}>
                    {toast.msg}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 className="page-title">My Leaves</h2>
                    <p className="page-subtitle">Manage your leave requests</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary" disabled={!empId}><Plus size={15} /> Apply for Leave</button>
            </div>

            {!empId && !loading && (
                <div style={{ background: 'var(--amber-pale)', border: '1px solid #FDE68A', borderLeft: '3px solid var(--amber)', borderRadius: 'var(--r-md)', padding: '14px 16px', fontSize: '0.85rem', color: '#92400E' }}>
                    ⚠ Your account email is not linked to an employee profile. Ask admin to create or link your profile.
                </div>
            )}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                    { label: 'Pending',       value: stats.pending,  color: 'var(--amber)',   bg: '#FEF3C7' },
                    { label: 'Approved',      value: stats.approved, color: 'var(--success)', bg: '#D1FAE5' },
                    { label: 'Rejected',      value: stats.rejected, color: 'var(--danger)',  bg: '#FEE2E2' },
                    { label: 'Days Approved', value: stats.totalDays,color: 'var(--forest)',  bg: '#D1FAE5' },
                ].map(c => (
                    <div key={c.label} className="card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '8px', height: '36px', borderRadius: '4px', background: c.color, flexShrink: 0 }} />
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: c.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{loading ? '—' : c.value}</div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '3px' }}>{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: '6px' }}>
                {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 16px', borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, background: filter === f ? 'var(--forest)' : 'var(--stone-100)', color: filter === f ? '#fff' : 'var(--text-muted)' }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Leave Cards */}
            {loading ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Calendar size={32} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                    No {filter !== 'All' ? filter.toLowerCase() : ''} leave requests
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                    {filtered.map(l => {
                        const days = daysDiff(l.from, l.to);
                        return (
                            <div key={l._id} className="card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{l.type} Leave</div>
                                        <span className={`badge ${badgeClass(l.status)}`}>{l.status}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--forest)', letterSpacing: '-0.03em', lineHeight: 1 }}>{days}</div>
                                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>DAYS</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                                    <Calendar size={13} />
                                    {new Date(l.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {new Date(l.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '8px 12px', background: 'var(--surface-raised)', borderRadius: 'var(--r-sm)', borderLeft: '2px solid var(--stone-300)' }}>
                                    {l.reason}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                                    Applied: {new Date(l.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Apply for Leave</h3>
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ borderRadius: '50%' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--stone-700)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Leave Type</label>
                                <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ appearance: 'auto' }}>
                                    {LEAVE_TYPES.map(t => <option key={t} value={t}>{t} Leave</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--stone-700)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>From</label>
                                    <input type="date" required className="input" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} min={new Date().toISOString().slice(0, 10)} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--stone-700)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>To</label>
                                    <input type="date" required className="input" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} min={form.from || new Date().toISOString().slice(0, 10)} />
                                </div>
                            </div>
                            {form.from && form.to && (
                                <div style={{ background: '#D1FAE5', color: '#166534', padding: '10px 14px', borderRadius: 'var(--r-md)', fontSize: '0.82rem', fontWeight: 600, textAlign: 'center' }}>
                                    📅 {daysDiff(form.from, form.to)} day(s) requested
                                </div>
                            )}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--stone-700)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reason</label>
                                <textarea required className="input" placeholder="Brief reason for leave…" style={{ minHeight: '80px', resize: 'vertical' }} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Request'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmpLeaves;
