import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard, UserCheck, Users,
    Calendar, TrendingUp, LogOut
} from 'lucide-react';

const navItems = [
    { path: '/',           label: 'Overview',    icon: <LayoutDashboard size={17} strokeWidth={1.8} />, end: true },
    { path: '/attendance', label: 'Attendance',  icon: <UserCheck size={17} strokeWidth={1.8} /> },
    { path: '/directory',  label: 'Team',        icon: <Users size={17} strokeWidth={1.8} /> },
    { path: '/leaves',     label: 'Leave Hub',   icon: <Calendar size={17} strokeWidth={1.8} /> },
    { path: '/analytics',  label: 'Analytics',   icon: <TrendingUp size={17} strokeWidth={1.8} /> },
];

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                OneClick<span>.</span>
            </div>

            <div className="sidebar-section-label">Main Menu</div>

            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">{initials}</div>
                    <div style={{ flex:1, overflow:'hidden' }}>
                        <div style={{ fontSize:'0.82rem', fontWeight:600, color:'rgba(255,255,255,0.9)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                            {user?.name}
                        </div>
                        <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.4)', textTransform:'capitalize' }}>
                            {user?.role}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Sign out"
                        style={{ background:'none', border:'none', cursor:'pointer', padding:'5px', borderRadius:'6px', display:'flex', alignItems:'center', color:'rgba(255,255,255,0.35)', transition:'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#FCA5A5'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
