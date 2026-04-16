import React, { useContext } from 'react';
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

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            <EmployeeSidebar />
            <div style={{ width: 'var(--sidebar-w)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
                <Header pageTitle={pageTitle} />
                <main style={{ flex: 1, padding: '28px', width: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
