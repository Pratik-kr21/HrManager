import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { User, Mail, Briefcase, Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const EmpProfile = () => {
    const { user } = useContext(AuthContext);
    const [empProfile, setEmpProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/employees');
                const emp = res.data.find(e => e.email?.toLowerCase() === user?.email?.toLowerCase());
                setEmpProfile(emp || null);
            } catch { /* no-op */ }
            finally { setLoading(false); }
        })();
    }, [user]);

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    const infoRows = empProfile ? [
        { icon: <Mail size={16}/>,      label: 'Email',      value: empProfile.email },
        { icon: <Briefcase size={16}/>, label: 'Role',       value: empProfile.role },
        { icon: <Building2 size={16}/>, label: 'Department', value: empProfile.department },
        { icon: <Calendar size={16}/>,  label: 'Joined',     value: format(new Date(empProfile.joinDate), 'MMMM d, yyyy') },
        { icon: <User size={16}/>,      label: 'Status',     value: empProfile.status },
    ] : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
                <h2 className="page-title">My Profile</h2>
                <p className="page-subtitle">Your employee information</p>
            </div>

            {loading ? (
                <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
            ) : !empProfile ? (
                <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                    <User size={40} style={{ display: 'block', margin: '0 auto 16px', color: 'var(--stone-300)' }} />
                    <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>No Employee Profile Found</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '320px', margin: '0 auto' }}>
                        Your account email <strong>{user?.email}</strong> is not linked to any employee profile. Please contact your admin to set this up.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                    {/* Left: Avatar Card */}
                    <div className="card" style={{ padding: '36px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800 }}>
                            {initials}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--charcoal)', letterSpacing: '-0.02em' }}>{empProfile.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>{empProfile.role}</p>
                        </div>
                        <span className={`badge ${empProfile.status === 'Active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.8rem', padding: '5px 16px' }}>
                            {empProfile.status}
                        </span>
                        <div style={{ width: '100%', height: '1px', background: 'var(--stone-200)' }} />
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            <div style={{ fontWeight: 600, color: 'var(--charcoal)', marginBottom: '2px' }}>Account Type</div>
                            <span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
                        </div>
                    </div>

                    {/* Right: Info Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div className="card" style={{ padding: '24px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--charcoal)', marginBottom: '18px' }}>Employee Information</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {infoRows.map((row, i) => (
                                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 0', borderBottom: i < infoRows.length - 1 ? '1px solid var(--stone-200)' : 'none' }}>
                                        <div style={{ width: '34px', height: '34px', borderRadius: 'var(--r-md)', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', flexShrink: 0 }}>
                                            {row.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</div>
                                            <div style={{ fontWeight: 600, color: 'var(--charcoal)', marginTop: '2px' }}>
                                                {row.label === 'Status'
                                                    ? <span className={`badge ${row.value === 'Active' ? 'badge-success' : 'badge-warning'}`}>{row.value}</span>
                                                    : row.value
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Account info */}
                        <div className="card" style={{ padding: '24px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--charcoal)', marginBottom: '18px' }}>Account Details</div>
                            {[
                                { label: 'Display Name', value: user?.name },
                                { label: 'Login Email',  value: user?.email },
                                { label: 'Role',         value: user?.role },
                            ].map((row, i, arr) => (
                                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--stone-200)' : 'none', fontSize: '0.88rem' }}>
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{row.label}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--charcoal)', textTransform: 'capitalize' }}>{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmpProfile;
