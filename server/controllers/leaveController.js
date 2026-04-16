const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

exports.getLeaves = async (req, res) => {
    try {
        const leaves = await LeaveRequest.find()
            .populate('employeeId', 'name department')
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.applyLeave = async (req, res) => {
    try {
        const { employeeId, type, from, to, reason } = req.body;

        // If no employeeId provided, try to find from logged-in user email
        let empId = employeeId;
        if (!empId && req.user) {
            const emp = await Employee.findOne({ email: req.user.email });
            if (emp) empId = emp._id;
        }

        if (!empId) return res.status(400).json({ message: 'Employee profile not found. Please link your account to an employee profile.' });

        const leave = await LeaveRequest.create({ employeeId: empId, type, from, to, reason });
        const populated = await leave.populate('employeeId', 'name department');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const leave = await LeaveRequest.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        ).populate('employeeId', 'name department');

        if (!leave) return res.status(404).json({ message: 'Leave request not found' });

        if (req.body.status === 'Approved') {
            await Employee.findByIdAndUpdate(leave.employeeId._id, { status: 'On Leave' });
        } else if (req.body.status === 'Rejected') {
            await Employee.findByIdAndUpdate(leave.employeeId._id, { status: 'Active' });
        }

        res.json(leave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// New: Get analytics summary from real data
exports.getAnalytics = async (req, res) => {
    try {
        const [employees, attendanceRecords, leaveRecords] = await Promise.all([
            Employee.find(),
            Attendance.find().populate('employeeId', 'name department'),
            LeaveRequest.find()
        ]);

        // Leave type distribution
        const leaveByType = leaveRecords.reduce((acc, l) => {
            acc[l.type] = (acc[l.type] || 0) + 1;
            return acc;
        }, {});

        // Attendance rate by week (last 4 weeks, group by week number)
        const weeklyMap = {};
        attendanceRecords.forEach(r => {
            const d = new Date(r.date);
            const weekStart = new Date(d);
            weekStart.setDate(d.getDate() - d.getDay());
            const key = weekStart.toISOString().slice(0, 10);
            if (!weeklyMap[key]) weeklyMap[key] = { present: 0, absent: 0, late: 0, total: 0 };
            weeklyMap[key].total++;
            if (r.status === 'Present') weeklyMap[key].present++;
            else if (r.status === 'Absent') weeklyMap[key].absent++;
            else if (r.status === 'Late') weeklyMap[key].late++;
        });

        const weeklyTrend = Object.entries(weeklyMap)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .slice(-4)
            .map(([date, data], i) => ({
                name: `Week ${i + 1}`,
                present: data.present,
                absent: data.absent,
                late: data.late,
                total: data.total
            }));

        // Avg hours
        const withHours = attendanceRecords.filter(r => r.hoursWorked > 0);
        const avgHours = withHours.length
            ? (withHours.reduce((s, r) => s + Number(r.hoursWorked), 0) / withHours.length).toFixed(1)
            : 0;

        // Attendance rate
        const totalRecords = attendanceRecords.length;
        const presentRecords = attendanceRecords.filter(r => r.status === 'Present').length;
        const attendanceRate = totalRecords ? ((presentRecords / totalRecords) * 100).toFixed(1) : 0;

        // Leave utilization
        const leaveUtil = employees.length
            ? ((leaveRecords.length / employees.length) * 100).toFixed(1)
            : 0;

        // Department breakdown
        const deptMap = {};
        employees.forEach(e => {
            if (!deptMap[e.department]) deptMap[e.department] = { total: 0, onLeave: 0 };
            deptMap[e.department].total++;
            if (e.status === 'On Leave') deptMap[e.department].onLeave++;
        });
        const deptBreakdown = Object.entries(deptMap).map(([name, data]) => ({
            name,
            total: data.total,
            active: data.total - data.onLeave,
            onLeave: data.onLeave
        }));

        res.json({
            summary: { avgHours, attendanceRate, leaveUtil, totalEmployees: employees.length },
            weeklyTrend: weeklyTrend.length ? weeklyTrend : [
                { name: 'Week 1', present: 0, absent: 0, late: 0 },
                { name: 'Week 2', present: 0, absent: 0, late: 0 },
            ],
            leaveByType: Object.entries(leaveByType).map(([name, value]) => ({ name, value })),
            deptBreakdown
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
