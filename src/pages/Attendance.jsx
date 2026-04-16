import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/api';
import { Download, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';

const Attendance = () => {
    const { user } = useContext(AuthContext);
    const [summary, setSummary] = useState([]);
    const [rawData, setRawData] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [loading, setLoading] = useState(true);
    const [monthFilter, setMonthFilter] = useState('All');

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await api.get('/attendance');
            const raw = res.data;
            setRawData(raw);

            const grouped = raw.reduce((acc, curr) => {
                const empId = curr.employeeId?._id;
                if (!empId) return acc;
                if (!acc[empId]) {
                    acc[empId] = {
                        employee: curr.employeeId,
                        present: 0, absent: 0, late: 0, totalHours: 0, records: []
                    };
                }
                if (curr.status === 'Present') acc[empId].present++;
                else if (curr.status === 'Absent') acc[empId].absent++;
                else if (curr.status === 'Late') acc[empId].late++;
                acc[empId].totalHours += Number(curr.hoursWorked) || 0;
                acc[empId].records.push(curr);
                return acc;
            }, {});

            setSummary(Object.values(grouped));
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchAttendance(); }, []);

    const toggleRow = (empId) => setExpandedRows(prev => ({ ...prev, [empId]: !prev[empId] }));

    const downloadCSV = () => {
        const headers = 'Employee,Department,Date,Status,Check In,Check Out,Hours Worked\n';
        const rows = rawData.map(r =>
            `"${r.employeeId?.name || 'Unknown'}","${r.employeeId?.department || ''}","${r.date}","${r.status}","${r.checkIn ? format(new Date(r.checkIn), 'hh:mm a') : ''}","${r.checkOut ? format(new Date(r.checkOut), 'hh:mm a') : ''}","${r.hoursWorked || 0}"`
        ).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `attendance_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    const totalPresent = summary.reduce((s, r) => s + r.present, 0);
    const totalAbsent  = summary.reduce((s, r) => s + r.absent, 0);
    const totalHours   = summary.reduce((s, r) => s + r.totalHours, 0);

    const statusColor = (s) => s === 'Present' ? 'var(--success)' : s === 'Absent' ? 'var(--danger)' : 'var(--amber)';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Header */}
            <div className="flex-between">
                <div>
                    <h2 className="page-title">Attendance Records</h2>
                    <p className="page-subtitle">Complete attendance history for your team</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={fetchAttendance} className="btn btn-secondary" title="Refresh">
                        <RefreshCw size={15} />
                    </button>
                    <button onClick={downloadCSV} className="btn btn-secondary" disabled={rawData.length === 0}>
                        <Download size={15} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Summary Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                {[
                    { label: 'Total Present Days', value: totalPresent, color: 'var(--forest)',  bg: '#D1FAE5' },
                    { label: 'Total Absent Days',  value: totalAbsent,  color: 'var(--danger)',  bg: 'var(--danger-bg)' },
                    { label: 'Total Hours Logged', value: `${totalHours.toFixed(0)}h`, color: 'var(--amber)', bg: 'var(--amber-pale)' },
                ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '10px', height: '40px', borderRadius: '4px', background: s.color, flexShrink: 0 }} />
                        <div>
                            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '3px' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Present</th>
                                <th>Absent</th>
                                <th>Late</th>
                                <th>Total Hours</th>
                                <th>Attendance Rate</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading records…</td></tr>
                            ) : summary.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    No attendance records found. Start a session from the Overview page.
                                </td></tr>
                            ) : summary.map(row => {
                                const total = row.present + row.absent + row.late;
                                const rate = total > 0 ? ((row.present / total) * 100).toFixed(0) : 0;
                                const isExpanded = expandedRows[row.employee._id];
                                return (
                                    <React.Fragment key={row.employee._id}>
                                        <tr style={{ cursor: 'pointer' }} onClick={() => toggleRow(row.employee._id)}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                                                        {row.employee.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{row.employee.name}</div>
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.employee.department}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="badge badge-success">{row.present}</span></td>
                                            <td><span className="badge badge-danger">{row.absent}</span></td>
                                            <td><span className="badge badge-warning">{row.late}</span></td>
                                            <td style={{ fontWeight: 600 }}>{row.totalHours.toFixed(1)} hrs</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div className="progress-track" style={{ width: '80px' }}>
                                                        <div className="progress-fill" style={{ width: `${rate}%`, background: Number(rate) >= 80 ? 'var(--forest)' : Number(rate) >= 60 ? 'var(--amber)' : 'var(--danger)' }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{rate}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </span>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={7} style={{ padding: 0, border: 'none' }}>
                                                    <div style={{ background: 'var(--surface-raised)', padding: '16px 20px', borderBottom: '1px solid var(--stone-200)' }}>
                                                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Day-by-Day Breakdown</p>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
                                                            {row.records.sort((a, b) => new Date(b.date) - new Date(a.date)).map(rec => (
                                                                <div key={rec._id} style={{ background: '#fff', border: '1px solid var(--stone-200)', padding: '10px 12px', borderRadius: 'var(--r-md)', fontSize: '0.82rem' }}>
                                                                    <div style={{ fontWeight: 600, color: 'var(--charcoal)', marginBottom: '4px' }}>
                                                                        {new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                    </div>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <span style={{ color: statusColor(rec.status), fontWeight: 600, fontSize: '0.78rem' }}>{rec.status}</span>
                                                                        <span style={{ color: 'var(--text-muted)' }}>{rec.hoursWorked ?? 0}h</span>
                                                                    </div>
                                                                    {rec.checkIn && (
                                                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                                            In: {format(new Date(rec.checkIn), 'hh:mm a')}
                                                                            {rec.checkOut && ` · Out: ${format(new Date(rec.checkOut), 'hh:mm a')}`}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
