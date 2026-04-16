import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import api from '../../utils/api';
import { Download, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const statusColor = (s) => s === 'Present' ? 'var(--success)' : s === 'Absent' ? 'var(--danger)' : 'var(--amber)';

const EmpAttendance = () => {
    const { user } = useContext(AuthContext);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [attRes, empRes] = await Promise.all([api.get('/attendance'), api.get('/employees')]);
            const emp = empRes.data.find(e => e.email?.toLowerCase() === user?.email?.toLowerCase());
            if (emp) {
                const myRecords = attRes.data
                    .filter(r => r.employeeId?._id === emp._id || r.employeeId === emp._id)
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
                setRecords(myRecords);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const downloadCSV = () => {
        const h = 'Date,Status,Check In,Check Out,Hours Worked\n';
        const rows = records.map(r =>
            `"${r.date}","${r.status}","${r.checkIn ? format(new Date(r.checkIn), 'hh:mm a') : ''}","${r.checkOut ? format(new Date(r.checkOut), 'hh:mm a') : ''}","${r.hoursWorked || 0}"`
        ).join('\n');
        const blob = new Blob([h + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'my_attendance.csv'; a.click();
    };

    const totalPresent = records.filter(r => r.status === 'Present').length;
    const totalLate    = records.filter(r => r.status === 'Late').length;
    const totalAbsent  = records.filter(r => r.status === 'Absent').length;
    const totalHours   = records.reduce((s, r) => s + (Number(r.hoursWorked) || 0), 0);
    const rate         = records.length ? ((totalPresent / records.length) * 100).toFixed(0) : 0;

    // Group by month
    const grouped = records.reduce((acc, r) => {
        const month = new Date(r.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        if (!acc[month]) acc[month] = [];
        acc[month].push(r);
        return acc;
    }, {});

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 className="page-title">My Attendance</h2>
                    <p className="page-subtitle">Your complete attendance history</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={fetchData} className="btn btn-secondary"><RefreshCw size={14} /></button>
                    <button onClick={downloadCSV} className="btn btn-secondary" disabled={records.length === 0}><Download size={14} /> Export</button>
                </div>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                    { label: 'Present', value: totalPresent,            color: 'var(--forest)', bg: '#D1FAE5' },
                    { label: 'Late',    value: totalLate,               color: 'var(--amber)',  bg: '#FEF3C7' },
                    { label: 'Absent',  value: totalAbsent,             color: 'var(--danger)', bg: '#FEE2E2' },
                    { label: 'Att. Rate', value: `${rate}%`,            color: 'var(--info)',   bg: 'var(--info-bg)' },
                ].map(c => (
                    <div key={c.label} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '8px', height: '36px', borderRadius: '4px', background: c.color, flexShrink: 0 }} />
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: c.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{loading ? '—' : c.value}</div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '3px' }}>{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Records grouped by month */}
            {loading ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
            ) : records.length === 0 ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No attendance records found. Start a session from My Overview.
                </div>
            ) : Object.entries(grouped).map(([month, recs]) => (
                <div key={month} className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', background: 'var(--surface-raised)', borderBottom: '1px solid var(--stone-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--charcoal)' }}>{month}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['Present', 'Late', 'Absent'].map(s => {
                                const cnt = recs.filter(r => r.status === s).length;
                                if (!cnt) return null;
                                const cls = s === 'Present' ? 'badge-success' : s === 'Late' ? 'badge-warning' : 'badge-danger';
                                return <span key={s} className={`badge ${cls}`}>{cnt} {s}</span>;
                            })}
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', padding: '16px' }}>
                        {recs.map(r => (
                            <div key={r._id} style={{ padding: '14px', background: 'var(--surface-raised)', border: '1px solid var(--stone-200)', borderRadius: 'var(--r-md)', borderLeft: `3px solid ${statusColor(r.status)}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                        {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </span>
                                    <span className={`badge ${r.status === 'Present' ? 'badge-success' : r.status === 'Late' ? 'badge-warning' : 'badge-danger'}`}>{r.status}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {r.checkIn && <span>🟢 In: {format(new Date(r.checkIn), 'hh:mm a')}</span>}
                                    {r.checkOut && <span>🔴 Out: {format(new Date(r.checkOut), 'hh:mm a')}</span>}
                                    {r.hoursWorked > 0 && <span>⏱ {r.hoursWorked}h worked</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EmpAttendance;
