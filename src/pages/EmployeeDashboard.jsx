import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import EmployeeSidebar from '../components/EmployeeSidebar';
import Header from '../components/Header';

const pageTitles = {
    '/emp':            'My Overview',
    '/emp/attendance': 'My Attendance',
    '/emp/leaves':     'My Leaves',
    '/emp/profile':    'My Profile',
};

const EmployeeDashboard = () => {
    const location = useLocation();
    const pageTitle = pageTitles[location.pathname] || 'Employee Portal';
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            <EmployeeSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="sidebar-spacer" style={{ width: 'var(--sidebar-w)', flexShrink: 0 }} />
            <div className="main-content-layout">
                <Header pageTitle={pageTitle} onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
                <main className="main-content-scroll">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
