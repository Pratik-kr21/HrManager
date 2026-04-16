import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import api from '../../utils/api';
import { Play, Square, Clock, Calendar, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

const dayStatusStyle = (s) => {
    if (s === 'Present')  return { bg: '#D1FAE5', color: '#166534' };
    if (s === 'Late')     return { bg: '#FEF3C7', color: '#92400E' };
    if (s === 'Absent')   return { bg: '#FEE2E2', color: '#991B1B' };
    return { bg: '#F5F5F4', color: '#78716C' };
};

const EmpOverview = () => {
    const { user } = useContext(AuthContext);
    const [sessionActive, setSessionActive] = useState(false);
    const [secs, setSecs] = useState(0);
    const [checkInTime, setCheckInTime] = useState(null);
    const [sessionMsg, setSessionMsg] = useState('');
    const [weekDays, setWeekDays] = useState([]);
    const [myLeaves, setMyLeaves] = useState([]);
    const [empProfile, setEmpProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let t; if (sessionActive) t = setInterval(() => setSecs(s => s + 1), 1000);
        return () => clearInterval(t);
    }, [sessionActive]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [weekRes, leaveRes, empRes] = await Promise.all([
                    api.get('/attendance/my-week'),
                    api.get('/leaves'),
                    api.get('/employees'),
                ]);
                setWeekDays(weekRes.data.week || []);

                // Filter leaves for current user's linked employee
                const emp = empRes.data.find(e => e.email?.toLowerCase() === user?.email?.toLowerCase());
                setEmpProfile(emp || null);

                if (emp) {
                    const myL = leaveRes.data.filter(l => l.employeeId?._id === emp._id || l.employeeId === emp._id);
                    setMyLeaves(myL.slice(0, 4));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, [user]);

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayRec = weekDays.find(d => d.isToday);

    const toggleSession = async () => {
        setSessionMsg('');
        try {
            if (!sessionActive) {
                await api.post('/attendance/checkin', { date: todayStr });
                setCheckInTime(new Date());
                setSessionActive(true);
            } else {
                await api.post('/attendance/checkout', { date: todayStr });
                setSessionActive(false); setSecs(0);
                setSessionMsg('✓ Session saved!');
                const weekRes = await api.get('/attendance/my-week');
                setWeekDays(weekRes.data.week || []);
            }
        } catch (err) { setSessionMsg(err.response?.data?.message || 'Error'); }
    };

    const fmtTime = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

    const presentCount = weekDays.filter(d => d.status === 'Present').length;
    const lateCount    = weekDays.filter(d => d.status === 'Late').length;
    const absentCount  = weekDays.filter(d => d.status === 'Absent').length;
    const totalHours   = weekDays.reduce((s, d) => s + (d.hoursWorked || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Welcome */}
            <div style={{ background: 'var(--forest)', borderRadius: 'var(--r-xl)', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                        Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>
                        {format(new Date(), 'EEEE, MMMM d, yyyy')} &nbsp;·&nbsp; {empProfile ? `${empProfile.role} · ${empProfile.department}` : 'Employee Portal'}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Today Status</div>
                    <span style={{ background: todayRec?.status === 'Present' ? '#D1FAE5' : todayRec?.status === 'Late' ? '#FEF3C7' : '#FEE2E2', color: todayRec?.status === 'Present' ? '#166534' : todayRec?.status === 'Late' ? '#92400E' : todayRec ? '#991B1B' : 'rgba(255,255,255,0.5)', padding: '5px 14px', borderRadius: '99px', fontWeight: 700, fontSize: '0.82rem' }}>
                        {todayRec?.status || 'Not checked in'}
                    </span>
                </div>
            </div>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                    { label: 'Present This Week', value: presentCount, icon: <CheckCircle size={20}/>, color: '#166534', bg: '#D1FAE5' },
                    { label: 'Late This Week',    value: lateCount,    icon: <Clock size={20}/>,       color: '#92400E', bg: '#FEF3C7' },
                    { label: 'Absent This Week',  value: absentCount,  icon: <AlertCircle size={20}/>, color: '#991B1B', bg: '#FEE2E2' },
                    { label: 'Hours This Week',   value: `${totalHours.toFixed(1)}h`, icon: <TrendingUp size={20}/>, color: 'var(--forest)', bg: '#D1FAE5' },
                ].map(c => (
                    <div key={c.label} className="card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: 'var(--r-md)', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
                            {c.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--charcoal)' }}>{loading ? '—' : c.value}</div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '3px' }}>{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Session + Week */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Session Tracker */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--charcoal)' }}>Session Tracker</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {sessionActive ? `In since ${format(checkInTime, 'hh:mm a')}` : 'No active session'}
                            </div>
                        </div>
                        <span className={`badge ${sessionActive ? 'badge-success' : 'badge-secondary'}`}>
                            {sessionActive ? '● Live' : '○ Idle'}
                        </span>
                    </div>
                    <div style={{ fontSize: '3.2rem', fontWeight: 800, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums', color: sessionActive ? 'var(--forest)' : 'var(--charcoal)', lineHeight: 1, marginBottom: '20px' }}>
                        {fmtTime(secs)}
                    </div>
                    {sessionMsg && <div style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600, marginBottom: '12px' }}>{sessionMsg}</div>}
                    {!empProfile && !loading && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--amber)', background: 'var(--amber-pale)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: '12px', fontWeight: 500 }}>
                            ⚠ Ask admin to link your account email to an employee profile
                        </div>
                    )}
                    <button onClick={toggleSession} disabled={!empProfile} className={`btn btn-lg ${sessionActive ? 'btn-secondary' : 'btn-primary'}`} style={{ width: '100%', opacity: empProfile ? 1 : 0.5 }}>
                        {sessionActive ? <><Square size={15} fill="currentColor"/> End Session</> : <><Play size={15} fill="currentColor"/> Start Session</>}
                    </button>
                </div>

                {/* This Week */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--charcoal)', marginBottom: '4px' }}>This Week</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '18px' }}>{format(new Date(), 'MMMM yyyy')}</div>
                    {weekDays.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                            {loading ? 'Loading…' : 'Your account is not linked to an employee profile yet.'}
                        </p>
                    ) : (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '14px' }}>
                                {weekDays.map(d => {
                                    const { bg, color } = dayStatusStyle(d.status);
                                    return (
                                        <div key={d.date} style={{ textAlign: 'center', padding: '10px 4px', borderRadius: 'var(--r-md)', background: d.isToday ? 'var(--forest)' : bg, border: d.isToday ? 'none' : '1px solid var(--stone-200)' }}>
                                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: d.isToday ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>{d.day}</div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: d.isToday ? '#fff' : color }}>{d.isFuture ? '—' : d.status === 'No Record' ? 'None' : d.status}</div>
                                            {d.hoursWorked > 0 && <div style={{ fontSize: '0.62rem', color: d.isToday ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)', marginTop: '3px' }}>{d.hoursWorked}h</div>}
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['Present', 'Late', 'Absent'].map(s => {
                                    const count = weekDays.filter(d => d.status === s).length;
                                    const { bg, color } = dayStatusStyle(s);
                                    return count > 0 ? <span key={s} style={{ background: bg, color, fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: '99px' }}>{count} {s}</span> : null;
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* My Recent Leaves */}
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ fontWeight: 700, color: 'var(--charcoal)', marginBottom: '4px' }}>My Recent Leave Requests</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '18px' }}>Latest requests you've submitted</div>
                {myLeaves.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No leave requests yet</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {myLeaves.map(l => {
                            const days = Math.ceil((new Date(l.to) - new Date(l.from)) / 86400000) + 1;
                            const badgeClass = l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning';
                            return (
                                <div key={l._id} style={{ padding: '14px', background: 'var(--surface-raised)', border: '1px solid var(--stone-200)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--r-md)', background: 'var(--amber-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Calendar size={18} color="var(--amber)" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{l.type} Leave</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{days} day{days !== 1 ? 's' : ''} · {new Date(l.from).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</div>
                                    </div>
                                    <span className={`badge ${badgeClass}`}>{l.status}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmpOverview;
