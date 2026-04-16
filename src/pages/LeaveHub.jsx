import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/api';
import { Plus, Check, X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const LEAVE_TYPES = ['Sick', 'Casual', 'Annual', 'Other'];

const LeaveHub = () => {
    const { user } = useContext(AuthContext);
    const [leaves, setLeaves] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({ employeeId: '', type: 'Casual', from: '', to: '', reason: '' });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leaveRes, empRes] = await Promise.all([api.get('/leaves'), api.get('/employees')]);
            setLeaves(leaveRes.data);
            setEmployees(empRes.data);
        } catch { showToast('Failed to load data', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleApply = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/leaves', formData);
            setShowModal(false);
            setFormData({ employeeId: '', type: 'Casual', from: '', to: '', reason: '' });
            await fetchData();
            showToast('Leave request submitted successfully');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to submit request', 'error');
        } finally { setSubmitting(false); }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/leaves/${id}/status`, { status });
            setLeaves(prev => prev.map(l => l._id === id ? { ...l, status } : l));
            showToast(`Leave ${status.toLowerCase()} successfully`);
        } catch { showToast('Failed to update status', 'error'); }
    };

    const statusBadge = (s) => {
        if (s === 'Approved') return 'badge-success';
        if (s === 'Rejected') return 'badge-danger';
        return 'badge-warning';
    };

    const stats = {
        pending:  leaves.filter(l => l.status === 'Pending').length,
        approved: leaves.filter(l => l.status === 'Approved').length,
        rejected: leaves.filter(l => l.status === 'Rejected').length,
    };

    const filtered = filter === 'All' ? leaves : leaves.filter(l => l.status === filter);

    const daysDiff = (from, to) => {
        const d = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
        return d > 0 ? d : 1;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '20px', right: '24px', zIndex: 999,
                    background: toast.type === 'error' ? 'var(--danger)' : 'var(--forest)',
                    color: '#fff', padding: '12px 20px', borderRadius: 'var(--r-lg)',
                    boxShadow: 'var(--shadow-lg)', fontSize: '0.88rem', fontWeight: 500,
                    animation: 'slideUp 0.2s ease'
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex-between">
                <div>
                    <h2 className="page-title">Leave Hub</h2>
                    <p className="page-subtitle">Manage and track all leave requests</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    <Plus size={16} /> Apply for Leave
                </button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                {[
                    { label: 'Pending Review', value: stats.pending,  icon: <Clock size={18}/>,        color: 'var(--amber)',   bg: 'var(--amber-pale)' },
                    { label: 'Approved',        value: stats.approved, icon: <Check size={18}/>,        color: 'var(--success)', bg: 'var(--success-bg)' },
                    { label: 'Rejected',        value: stats.rejected, icon: <AlertCircle size={18}/>, color: 'var(--danger)',  bg: 'var(--danger-bg)' },
                ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--r-md)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                            {s.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '3px' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
                {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '7px 16px', borderRadius: 'var(--r-full)', border: 'none',
                            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--t)',
                            background: filter === f ? 'var(--forest)' : 'var(--stone-100)',
                            color: filter === f ? '#fff' : 'var(--text-muted)'
                        }}
                    >
                        {f}
                        {f !== 'All' && <span style={{ marginLeft: '6px', opacity: 0.7 }}>({stats[f.toLowerCase()] ?? leaves.length})</span>}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Type</th>
                                <th>Duration</th>
                                <th>Days</th>
                                <th>Reason</th>
                                <th>Status</th>
                                {user?.role === 'admin' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={user?.role === 'admin' ? 7 : 6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={user?.role === 'admin' ? 7 : 6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    <Calendar size={32} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.3 }} />
                                    No {filter !== 'All' ? filter.toLowerCase() : ''} leave requests found
                                </td></tr>
                            ) : filtered.map(leave => (
                                <tr key={leave._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                                                {leave.employeeId?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{leave.employeeId?.name || 'Unknown'}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{leave.employeeId?.department}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-secondary">{leave.type}</span></td>
                                    <td style={{ fontSize: '0.82rem' }}>
                                        {new Date(leave.from).toLocaleDateString('en-IN', { day:'numeric', month:'short' })} → {new Date(leave.to).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: 'var(--forest)' }}>{daysDiff(leave.from, leave.to)}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> days</span>
                                    </td>
                                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {leave.reason}
                                    </td>
                                    <td><span className={`badge ${statusBadge(leave.status)}`}>{leave.status}</span></td>
                                    {user?.role === 'admin' && (
                                        <td>
                                            {leave.status === 'Pending' ? (
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button
                                                        onClick={() => updateStatus(leave._id, 'Approved')}
                                                        title="Approve"
                                                        style={{ padding: '6px 10px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', background: 'var(--success-bg)', color: 'var(--success)', fontWeight: 600, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <Check size={13} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(leave._id, 'Rejected')}
                                                        title="Reject"
                                                        style={{ padding: '6px 10px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', background: 'var(--danger-bg)', color: 'var(--danger)', fontWeight: 600, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <X size={13} /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Processed</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Apply Leave Modal */}
            {showModal && (
                <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box">
                        <div className="flex-between" style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--charcoal)' }}>Apply for Leave</h3>
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ borderRadius: '50%' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--stone-700)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Employee</label>
                                <select required className="input" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} style={{ appearance: 'auto' }}>
                                    <option value="">Select employee…</option>
                                    {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} — {emp.department}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--stone-700)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Leave Type</label>
                                <select required className="input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ appearance: 'auto' }}>
                                    {LEAVE_TYPES.map(t => <option key={t} value={t}>{t} Leave</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--stone-700)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>From</label>
                                    <input type="date" required className="input" value={formData.from} onChange={e => setFormData({ ...formData, from: e.target.value })} min={new Date().toISOString().slice(0,10)} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--stone-700)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>To</label>
                                    <input type="date" required className="input" value={formData.to} onChange={e => setFormData({ ...formData, to: e.target.value })} min={formData.from || new Date().toISOString().slice(0,10)} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--stone-700)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reason</label>
                                <textarea required className="input" placeholder="Brief reason for this leave…" style={{ borderRadius: 'var(--r-md)', minHeight: '80px', resize: 'vertical' }} value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                            </div>
                            {formData.from && formData.to && (
                                <div style={{ background: 'var(--forest)', color: '#fff', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: '0.82rem', textAlign: 'center' }}>
                                    📅 {daysDiff(formData.from, formData.to)} day(s) leave requested
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Submitting…' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveHub;
