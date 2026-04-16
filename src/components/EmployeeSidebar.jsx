import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, UserCheck, Calendar, User, LogOut } from 'lucide-react';

const empNav = [
    { path: '/emp',            label: 'My Overview',  icon: <LayoutDashboard size={17} strokeWidth={1.8} />, end: true },
    { path: '/emp/attendance', label: 'My Attendance', icon: <UserCheck size={17} strokeWidth={1.8} /> },
    { path: '/emp/leaves',     label: 'My Leaves',    icon: <Calendar size={17} strokeWidth={1.8} /> },
    { path: '/emp/profile',    label: 'My Profile',   icon: <User size={17} strokeWidth={1.8} /> },
];

const EmployeeSidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                OneClick<span>.</span>
            </div>

            <div className="sidebar-section-label">Employee Portal</div>

            <nav className="sidebar-nav">
                {empNav.map(item => (
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
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Employee</div>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        title="Sign out"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '6px', display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}
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

export default EmployeeSidebar;
