import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Edit2, Trash2, Search, X, Users } from 'lucide-react';

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

const avatarColor = (name) => {
    const colors = ['#1B4332', '#374151', '#7C3AED', '#B45309', '#0369A1', '#BE185D', '#065F46'];
    const i = name.charCodeAt(0) % colors.length;
    return colors[i];
};

const TeamDirectory = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingEmp, setEditingEmp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({ name: '', role: '', department: '', email: '', status: 'Active' });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await api.get('/employees');
            setEmployees(res.data);
        } catch { showToast('Failed to load employees', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const openAdd = () => {
        setEditingEmp(null);
        setFormData({ name: '', role: '', department: DEPARTMENTS[0], email: '', status: 'Active' });
        setShowModal(true);
    };

    const openEdit = (emp) => {
        setEditingEmp(emp);
        setFormData({ name: emp.name, role: emp.role, department: emp.department, email: emp.email, status: emp.status });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingEmp) {
                await api.put(`/employees/${editingEmp._id}`, formData);
                showToast('Employee updated successfully');
            } else {
                await api.post('/employees', formData);
                showToast('Employee added successfully');
            }
            setShowModal(false);
            await fetchEmployees();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save employee', 'error');
        } finally { setSubmitting(false); }
    };

    const deleteEmployee = async (id, name) => {
        if (!window.confirm(`Remove ${name} from the team?`)) return;
        try {
            await api.delete(`/employees/${id}`);
            setEmployees(prev => prev.filter(e => e._id !== id));
            showToast('Employee removed');
        } catch { showToast('Failed to remove employee', 'error'); }
    };

    const departments = ['All', ...new Set(employees.map(e => e.department))];

    const filtered = employees.filter(e => {
        const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.email.toLowerCase().includes(search.toLowerCase()) ||
            e.role.toLowerCase().includes(search.toLowerCase());
        const matchDept = deptFilter === 'All' || e.department === deptFilter;
        return matchSearch && matchDept;
    });

    const initials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {toast && (
                <div style={{ position: 'fixed', top: '20px', right: '24px', zIndex: 999, background: toast.type === 'error' ? 'var(--danger)' : 'var(--forest)', color: '#fff', padding: '12px 20px', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-lg)', fontSize: '0.88rem', fontWeight: 500, animation: 'slideUp 0.2s ease' }}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex-between">
                <div>
                    <h2 className="page-title">Team Directory</h2>
                    <p className="page-subtitle">{employees.length} team member{employees.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={openAdd} className="btn btn-primary"><Plus size={16} /> Add Employee</button>
            </div>

            {/* Search + Dept Filter */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--stone-500)', pointerEvents: 'none' }} />
                    <input
                        type="text" placeholder="Search by name, role, email…" className="input"
                        style={{ paddingLeft: '36px' }} value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {departments.map(d => (
                        <button key={d} onClick={() => setDeptFilter(d)}
                            style={{ padding: '7px 14px', borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'var(--t)', background: deptFilter === d ? 'var(--forest)' : 'var(--stone-100)', color: deptFilter === d ? '#fff' : 'var(--text-muted)' }}>
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    <Users size={32} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.3 }} />
                                    {search ? `No employees matching "${search}"` : 'No employees yet. Add your first team member!'}
                                </td></tr>
                            ) : filtered.map(emp => (
                                <tr key={emp._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: avatarColor(emp.name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>
                                                {initials(emp.name)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{emp.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{emp.role}</td>
                                    <td><span className="badge badge-secondary">{emp.department}</span></td>
                                    <td>
                                        <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                        {new Date(emp.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button title="Edit" onClick={() => openEdit(emp)}
                                                style={{ padding: '6px', border: '1px solid var(--stone-200)', borderRadius: 'var(--r-sm)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)', transition: 'var(--t)' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--forest)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--forest)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--stone-200)'; }}
                                            ><Edit2 size={14} /></button>
                                            <button title="Delete" onClick={() => deleteEmployee(emp._id, emp.name)}
                                                style={{ padding: '6px', border: '1px solid var(--stone-200)', borderRadius: 'var(--r-sm)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)', transition: 'var(--t)' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--stone-200)'; }}
                                            ><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box">
                        <div className="flex-between" style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{editingEmp ? 'Edit Employee' : 'Add New Employee'}</h3>
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ borderRadius: '50%' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {[
                                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Pratik Kumar' },
                                { label: 'Email', key: 'email', type: 'email', placeholder: 'pratik@company.com' },
                                { label: 'Role / Job Title', key: 'role', type: 'text', placeholder: 'Senior Engineer' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--stone-700)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                                    <input type={f.type} className="input" placeholder={f.placeholder} required value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} />
                                </div>
                            ))}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--stone-700)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Department</label>
                                    <select className="input" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} style={{ appearance: 'auto' }}>
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--stone-700)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</label>
                                    <select className="input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ appearance: 'auto' }}>
                                        <option value="Active">Active</option>
                                        <option value="On Leave">On Leave</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving…' : editingEmp ? 'Save Changes' : 'Add Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamDirectory;
