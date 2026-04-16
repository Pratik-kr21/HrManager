import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const pageTitles = {
    '/':           'Overview',
    '/attendance': 'Attendance',
    '/directory':  'Team Directory',
    '/leaves':     'Leave Hub',
    '/analytics':  'Analytics',
};

const Dashboard = () => {
    const location = useLocation();
    const pageTitle = pageTitles[location.pathname] || 'Dashboard';

    return (
        /*
         * Layout pattern:
         *   ┌─────────────────────────────────────────────┐
         *   │ Sidebar (fixed, 228px)  │  Content column   │
         *   │                         │  ┌── Header (sticky, full-width of column)
         *   │                         │  ├── <main> fills rest
         *   └─────────────────────────────────────────────┘
         */
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

            {/* Fixed sidebar — out of normal flow */}
            <Sidebar />

            {/* Spacer div — same width as fixed sidebar; pushes content column right */}
            <div style={{ width: 'var(--sidebar-w)', flexShrink: 0 }} />

            {/* Content column — fills ALL remaining width */}
            <div style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg)',
                overflow: 'hidden',
            }}>
                {/* Sticky header — spans full width of this column */}
                <Header pageTitle={pageTitle} />

                {/* Page content */}
                <main style={{
                    flex: 1,
                    padding: '28px',
                    width: '100%',
                    boxSizing: 'border-box',
                    overflowY: 'auto',
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
