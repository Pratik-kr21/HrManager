import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, Clock } from 'lucide-react';
import { format } from 'date-fns';

const Header = ({ pageTitle }) => {
    const { user } = useContext(AuthContext);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const greeting = (() => {
        const h = time.getHours();
        return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    })();

    return (
        <header className="app-header">
            <div>
                <h2 style={{ fontSize:'1rem', fontWeight:700, color:'var(--charcoal)', letterSpacing:'-0.01em' }}>
                    {pageTitle}
                </h2>
                <p style={{ fontSize:'0.72rem', color:'var(--stone-500)', marginTop:'1px' }}>
                    {greeting}, {user?.name?.split(' ')[0]} — {format(time, 'EEEE, MMMM d')}
                </p>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                {/* Live clock chip */}
                <div style={{ display:'flex', alignItems:'center', gap:'5px', background:'var(--stone-100)', border:'1px solid var(--stone-200)', padding:'5px 12px', borderRadius:'var(--r-full)', fontSize:'0.78rem', fontWeight:500, color:'var(--stone-700)', fontVariantNumeric:'tabular-nums' }}>
                    <Clock size={13} style={{ color:'var(--amber)' }} />
                    {format(time, 'hh:mm:ss a')}
                </div>

                {/* Notification bell */}
                <button className="btn btn-ghost" style={{ borderRadius:'50%', padding:'8px', position:'relative' }}>
                    <Bell size={17} />
                </button>

                {/* User chip */}
                <div style={{ display:'flex', alignItems:'center', gap:'9px', background:'var(--surface)', border:'1px solid var(--stone-200)', padding:'6px 14px 6px 6px', borderRadius:'var(--r-full)' }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'var(--forest)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.72rem', fontWeight:700 }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--charcoal)' }}>{user?.name?.split(' ')[0]}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
