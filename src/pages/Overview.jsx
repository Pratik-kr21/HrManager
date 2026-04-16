import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';
import api from '../utils/api';
import {
    Play, Square, Users, UserCheck, UserX,
    Clock, TrendingUp, AlertCircle, CheckCircle,
    Calendar, Briefcase
} from 'lucide-react';

/* ── Tiny helpers ─────────────────────────── */
const dayStatusStyle = (s) => {
    if (s === 'Present') return { bg: '#D1FAE5', color: '#166534' };
    if (s === 'Late')    return { bg: '#FEF3C7', color: '#92400E' };
    if (s === 'Absent')  return { bg: '#FEE2E2', color: '#991B1B' };
    if (s === 'Upcoming')return { bg: '#F5F5F4', color: '#78716C' };
    return { bg: '#F5F5F4', color: '#78716C' };
};

const StatBadge = ({ status }) => {
    const { bg, color } = dayStatusStyle(status);
    return (
        <span style={{ background: bg, color, fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: '99px', display: 'inline-block' }}>
            {status}
        </span>
    );
};

/* ── Main Component ───────────────────────── */
const Overview = () => {
    const { user } = useContext(AuthContext);

    // Session state
    const [sessionActive, setSessionActive] = useState(false);
    const [secs, setSecs] = useState(0);
    const [checkInTime, setCheckInTime] = useState(null);
    const [sessionMsg, setSessionMsg] = useState('');

    // Dashboard data
    const [stats, setStats]         = useState({ total: 0, present: 0, onLeave: 0, pending: 0 });
    const [weekDays, setWeekDays]   = useState([]);
    const [depts, setDepts]         = useState([]);
    const [recentLeaves, setRecentLeaves] = useState([]);
    const [loading, setLoading]     = useState(true);

    /* Live clock for session */
    useEffect(() => {
        let t; if (sessionActive) t = setInterval(() => setSecs(s => s + 1), 1000);
        return () => clearInterval(t);
    }, [sessionActive]);

    /* Fetch all dashboard data */
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [empRes, leaveRes, weekRes] = await Promise.all([
                    api.get('/employees'),
                    api.get('/leaves'),
                    api.get('/attendance/my-week'),
                ]);

                const emps   = empRes.data;
                const leaves = leaveRes.data;

                /* KPI */
                setStats({
                    total:   emps.length,
                    present: emps.filter(e => e.status === 'Active').length,
                    onLeave: emps.filter(e => e.status === 'On Leave').length,
                    pending: leaves.filter(l => l.status === 'Pending').length,
                });

                /* Week days (from backend) */
                setWeekDays(weekRes.data.week || []);

                /* Dept health (from real employees) */
                const deptMap = {};
                emps.forEach(e => {
                    if (!deptMap[e.department]) deptMap[e.department] = { total: 0, active: 0 };
                    deptMap[e.department].total++;
                    if (e.status === 'Active') deptMap[e.department].active++;
                });
                const deptArray = Object.entries(deptMap)
                    .map(([name, d]) => ({
                        name,
                        pct: d.total > 0 ? Math.round((d.active / d.total) * 100) : 0
                    }))
                    .sort((a, b) => b.pct - a.pct)
                    .slice(0, 5);
                setDepts(deptArray);

                /* Recent leaves */
                setRecentLeaves(leaves.slice(0, 5));

            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const todayStr = new Date().toISOString().slice(0, 10);

    const toggleSession = async () => {
        setSessionMsg('');
        try {
            if (!sessionActive) {
                await api.post('/attendance/checkin', { date: todayStr });
                setCheckInTime(new Date());
                setSessionActive(true);
            } else {
                await api.post('/attendance/checkout', { date: todayStr });
                setSessionActive(false);
                setSecs(0);
                setSessionMsg('✓ Session saved successfully');
                // Refresh week
                const weekRes = await api.get('/attendance/my-week');
                setWeekDays(weekRes.data.week || []);
            }
        } catch (err) {
            setSessionMsg(err.response?.data?.message || 'Error');
        }
    };

    const fmtTime = s => {
        const h = String(Math.floor(s / 3600)).padStart(2, '0');
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
        const sc = String(s % 60).padStart(2, '0');
        return `${h}:${m}:${sc}`;
    };

    const pctBarColor = (p) => p >= 80 ? 'var(--forest-light)' : p >= 60 ? 'var(--amber)' : 'var(--danger)';

    const leaveBadge = (s) => s === 'Approved' ? 'badge-success' : s === 'Rejected' ? 'badge-danger' : 'badge-warning';

    /* ── Today's summary for logged-in user ── */
    const todayRec = weekDays.find(d => d.isToday);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ── Row 1: KPI Cards (4-up, full width) ──────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                    { label: 'Total Employees',  value: stats.total,   icon: <Users size={20}/>,     color: '#1B4332', bg: '#D1FAE5' },
                    { label: 'Active Today',      value: stats.present, icon: <UserCheck size={20}/>, color: '#D97706', bg: '#FEF3C7' },
                    { label: 'On Leave',          value: stats.onLeave, icon: <UserX size={20}/>,     color: '#DC2626', bg: '#FEE2E2' },
                    { label: 'Pending Approvals', value: stats.pending, icon: <Clock size={20}/>,     color: '#7C3AED', bg: '#EDE9FE' },
                ].map(c => (
                    <div key={c.label} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
                            {c.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--charcoal)' }}>
                                {loading ? '—' : c.value}
                            </div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' }}>
                                {c.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Row 2: Session Tracker + This Week ───────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                {/* Session Tracker */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--charcoal)' }}>Session Tracker</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {sessionActive ? `Checked in at ${format(checkInTime, 'hh:mm a')}` : 'No active session'}
                            </div>
                        </div>
                        <span className={`badge ${sessionActive ? 'badge-success' : 'badge-secondary'}`}>
                            {sessionActive ? '● Live' : '○ Idle'}
                        </span>
                    </div>

                    <div style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums', color: sessionActive ? 'var(--forest)' : 'var(--charcoal)', lineHeight: 1, marginBottom: '20px' }}>
                        {fmtTime(secs)}
                    </div>

                    {sessionMsg && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600, marginBottom: '12px' }}>{sessionMsg}</div>
                    )}

                    <button onClick={toggleSession} className={`btn btn-lg ${sessionActive ? 'btn-secondary' : 'btn-primary'}`} style={{ width: '100%' }}>
                        {sessionActive
                            ? <><Square size={15} fill="currentColor"/> End Session</>
                            : <><Play  size={15} fill="currentColor"/> Start Session</>
                        }
                    </button>

                    {/* Today summary */}
                    {todayRec && todayRec.status !== 'No Record' && todayRec.status !== 'Upcoming' && (
                        <div style={{ marginTop: '16px', background: 'var(--surface-raised)', borderRadius: 'var(--r-md)', padding: '12px 14px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Today's Status</span>
                            <StatBadge status={todayRec.status} />
                        </div>
                    )}
                </div>

                {/* This Week */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--charcoal)', marginBottom: '4px' }}>This Week</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                        Your attendance — {format(new Date(), 'MMMM yyyy')}
                    </div>

                    {weekDays.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {loading ? 'Loading…' : 'Link your account to an employee profile to see weekly data.'}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                            {weekDays.map(d => {
                                const { bg, color } = dayStatusStyle(d.status);
                                return (
                                    <div key={d.date} style={{ textAlign: 'center', padding: '10px 4px', borderRadius: 'var(--r-md)', background: d.isToday ? 'var(--forest)' : bg, border: d.isToday ? 'none' : '1px solid var(--stone-200)', transition: 'var(--t)' }}>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: d.isToday ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                                            {d.day}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: d.isToday ? '#fff' : color }}>
                                            {d.isFuture ? '—' : d.status === 'No Record' ? 'None' : d.status}
                                        </div>
                                        {d.hoursWorked > 0 && (
                                            <div style={{ fontSize: '0.65rem', color: d.isToday ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)', marginTop: '3px' }}>
                                                {d.hoursWorked}h
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Week summary */}
                    {weekDays.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                            {['Present', 'Late', 'Absent'].map(s => {
                                const count = weekDays.filter(d => d.status === s).length;
                                const { bg, color } = dayStatusStyle(s);
                                return count > 0 ? (
                                    <span key={s} style={{ background: bg, color, fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: '99px' }}>
                                        {count} {s}
                                    </span>
                                ) : null;
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Row 3: Department Health + Recent Leave Requests ─────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '16px' }}>

                {/* Department Health */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--charcoal)', marginBottom: '4px' }}>Department Health</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Active employee rate per department</div>

                    {loading ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading…</div>
                    ) : depts.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                            Add employees to see department data
                        </div>
                    ) : depts.map(d => (
                        <div key={d.name} style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Briefcase size={13} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--stone-700)' }}>{d.name}</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: pctBarColor(d.pct) }}>{d.pct}%</span>
                            </div>
                            <div style={{ width: '100%', height: '7px', background: 'var(--stone-100)', borderRadius: '99px', overflow: 'hidden' }}>
                                <div style={{ width: `${d.pct}%`, height: '100%', background: pctBarColor(d.pct), borderRadius: '99px', transition: 'width 1s ease' }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Leave Requests */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--charcoal)', marginBottom: '4px' }}>Recent Leave Requests</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Latest 5 requests across the team</div>

                    {loading ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading…</div>
                    ) : recentLeaves.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <Calendar size={28} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.3 }} />
                            No leave requests yet
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {recentLeaves.map(l => {
                                const days = Math.ceil((new Date(l.to) - new Date(l.from)) / (1000 * 60 * 60 * 24)) + 1;
                                return (
                                    <div key={l._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: 'var(--r-md)', background: 'var(--surface-raised)', border: '1px solid var(--stone-200)' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                                            {l.employeeId?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {l.employeeId?.name || 'Unknown'}
                                            </div>
                                            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                                                {l.type} · {days} day{days !== 1 ? 's' : ''} · {new Date(l.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>
                                        <span className={`badge ${leaveBadge(l.status)}`}>{l.status}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Row 4: Quick Stats Strip ──────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                    {
                        label: 'Attendance Rate',
                        value: stats.total > 0 ? `${Math.round((stats.present / stats.total) * 100)}%` : '—',
                        sub: 'Based on active vs total employees',
                        icon: <TrendingUp size={18}/>, color: 'var(--forest)', bg: '#D1FAE5'
                    },
                    {
                        label: 'Leave Requests',
                        value: recentLeaves.length,
                        sub: `${recentLeaves.filter(l => l.status === 'Pending').length} pending approval`,
                        icon: <Calendar size={18}/>, color: 'var(--amber)', bg: '#FEF3C7'
                    },
                    {
                        label: 'Departments',
                        value: depts.length,
                        sub: `${depts.filter(d => d.pct === 100).length} fully staffed today`,
                        icon: <Briefcase size={18}/>, color: 'var(--info)', bg: 'var(--info-bg)'
                    },
                ].map(c => (
                    <div key={c.label} className="card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--r-md)', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
                            {c.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--charcoal)' }}>{loading ? '—' : c.value}</div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '3px' }}>{c.label}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--stone-500)', marginTop: '4px' }}>{c.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default Overview;
