import React, { useState, useEffect } from 'react';
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
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Auto-close mobile drawer when route changes
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            {/* Sidebar drawer (fixed desktop, off-canvas drawer on mobile) */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Spacer div — only visible on desktop (hidden on mobile via CSS) */}
            <div className="sidebar-spacer" style={{ width: 'var(--sidebar-w)', flexShrink: 0 }} />

            {/* Content column — fills ALL remaining width */}
            <div className="main-content-layout">
                {/* Sticky header */}
                <Header pageTitle={pageTitle} onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

                {/* Page content with responsive padding */}
                <main className="main-content-scroll">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
