import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerificationSent from './pages/VerificationSent';
import VerificationSuccess from './pages/VerificationSuccess';

// Admin dashboard
import Dashboard from './pages/Dashboard';
import Overview from './pages/Overview';
import Attendance from './pages/Attendance';
import TeamDirectory from './pages/TeamDirectory';
import LeaveHub from './pages/LeaveHub';
import Analytics from './pages/Analytics';

// Employee dashboard
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmpOverview from './pages/emp/EmpOverview';
import EmpAttendance from './pages/emp/EmpAttendance';
import EmpLeaves from './pages/emp/EmpLeaves';
import EmpProfile from './pages/emp/EmpProfile';

/* ── Route Guards ─────────────────────────────────────────────── */
const PrivateRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/emp" replace />;
    return children;
};

const EmployeeRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'admin') return <Navigate to="/" replace />;
    return children;
};

// After login, redirect to the right dashboard
const HomeRedirect = () => {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/login" replace />;
    return user.role === 'admin' ? <Navigate to="/" replace /> : <Navigate to="/emp" replace />;
};

/* ── App ──────────────────────────────────────────────────────── */
function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/login"           element={<Login />} />
                <Route path="/signup"          element={<Signup />} />
                <Route path="/verify-sent"     element={<VerificationSent />} />
                <Route path="/verify-success"  element={<VerificationSuccess />} />

                {/* Admin Dashboard */}
                <Route path="/" element={<AdminRoute><Dashboard /></AdminRoute>}>
                    <Route index       element={<Overview />} />
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="directory"  element={<TeamDirectory />} />
                    <Route path="leaves"     element={<LeaveHub />} />
                    <Route path="analytics"  element={<Analytics />} />
                </Route>

                {/* Employee Dashboard */}
                <Route path="/emp" element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>}>
                    <Route index            element={<EmpOverview />} />
                    <Route path="attendance" element={<EmpAttendance />} />
                    <Route path="leaves"     element={<EmpLeaves />} />
                    <Route path="profile"    element={<EmpProfile />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<HomeRedirect />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
