import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import api from '../utils/api';
import { TrendingUp, Users, Clock, Calendar } from 'lucide-react';

const COLORS = ['#1B4332', '#D97706', '#7C3AED', '#DC2626', '#0369A1'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div style={{ background: '#fff', border: '1px solid var(--stone-200)', borderRadius: 'var(--r-md)', padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: '0.82rem' }}>
                <p style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--charcoal)' }}>{label}</p>
                {payload.map(p => (
                    <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
                ))}
            </div>
        );
    }
    return null;
};

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await api.get('/leaves/analytics');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally { setLoading(false); }
        })();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--text-muted)', flexDirection: 'column', gap: '12px' }}>
            <span className="spin" style={{ width: '32px', height: '32px', border: '3px solid var(--stone-200)', borderTopColor: 'var(--forest)', borderRadius: '50%' }} />
            Loading analytics…
        </div>
    );

    const { summary, weeklyTrend, leaveByType, deptBreakdown } = data || {};

    const summaryCards = [
        { label: 'Avg Work Hours / Day', value: `${summary?.avgHours ?? 0}h`, icon: <Clock size={20} />, color: 'var(--forest)',   bg: '#D1FAE5' },
        { label: 'Attendance Rate',      value: `${summary?.attendanceRate ?? 0}%`, icon: <TrendingUp size={20} />, color: 'var(--amber)', bg: 'var(--amber-pale)' },
        { label: 'Leave Utilization',    value: `${summary?.leaveUtil ?? 0}%`,  icon: <Calendar size={20} />, color: 'var(--info)',  bg: 'var(--info-bg)' },
        { label: 'Total Employees',      value: summary?.totalEmployees ?? 0,   icon: <Users size={20} />,    color: 'var(--forest-mid)', bg: '#D1FAE5' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
                <h2 className="page-title">Analytics</h2>
                <p className="page-subtitle">Real-time workforce insights from your data</p>
            </div>

            {/* Summary KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                {summaryCards.map(c => (
                    <div key={c.label} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: 'var(--r-md)', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
                            {c.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--charcoal)' }}>{c.value}</div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '3px' }}>{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '18px' }}>
                {/* Weekly Attendance Trend */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '20px' }}>Weekly Attendance Trend</h3>
                    {weeklyTrend?.length ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={weeklyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--stone-200)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--stone-500)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: 'var(--stone-500)' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.78rem', paddingTop: '8px' }} />
                                <Bar dataKey="present" name="Present" fill="var(--forest)"  radius={[4, 4, 0, 0]} />
                                <Bar dataKey="absent"  name="Absent"  fill="var(--danger)"  radius={[4, 4, 0, 0]} />
                                <Bar dataKey="late"    name="Late"    fill="var(--amber)"   radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>No attendance data yet</p>}
                </div>

                {/* Leave Type Distribution */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '20px' }}>Leave Distribution</h3>
                    {leaveByType?.length ? (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={leaveByType} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                                        {leaveByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                                {leaveByType.map((item, i) => (
                                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                            <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 700 }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0 20px' }}>No leave data yet</p>}
                </div>
            </div>

            {/* Department Breakdown */}
            {deptBreakdown?.length > 0 && (
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '20px' }}>Department Breakdown</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                        {deptBreakdown.map((dept, i) => (
                            <div key={dept.name} style={{ padding: '18px', borderRadius: 'var(--r-md)', background: 'var(--surface-raised)', border: '1px solid var(--stone-200)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{dept.name}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS[i % COLORS.length] }}>{dept.total} members</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                    <span className="badge badge-success">{dept.active} Active</span>
                                    {dept.onLeave > 0 && <span className="badge badge-warning">{dept.onLeave} On Leave</span>}
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${dept.total > 0 ? (dept.active / dept.total) * 100 : 0}%`, background: COLORS[i % COLORS.length] }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
