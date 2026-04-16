const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

exports.getAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate('employeeId', 'name department')
            .sort({ date: -1 });
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get current user's attendance for this week
exports.getMyWeek = async (req, res) => {
    try {
        const employee = await Employee.findOne({ email: req.user.email });
        if (!employee) return res.json({ records: [], employee: null });

        // Build Mon–Sun for current week
        const today = new Date();
        const dow = today.getDay(); // 0=Sun
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));

        const weekDates = [];
        for (let i = 0; i < 5; i++) {          // Mon to Fri
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            weekDates.push(d.toISOString().slice(0, 10));
        }

        const records = await Attendance.find({
            employeeId: employee._id,
            date: { $in: weekDates }
        });

        // Build a map: date -> record
        const recordMap = {};
        records.forEach(r => { recordMap[r.date] = r; });

        const week = weekDates.map(date => {
            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            const idx = weekDates.indexOf(date);
            const isPast = new Date(date) < new Date(new Date().toISOString().slice(0, 10));
            const isToday = date === new Date().toISOString().slice(0, 10);
            const rec = recordMap[date];
            return {
                date,
                day: dayNames[idx],
                status: rec ? rec.status : (isPast ? 'Absent' : isToday ? 'No Record' : 'Upcoming'),
                isToday,
                isFuture: !isPast && !isToday,
                checkIn: rec?.checkIn || null,
                checkOut: rec?.checkOut || null,
                hoursWorked: rec?.hoursWorked || 0,
            };
        });

        res.json({ week, employeeId: employee._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.checkIn = async (req, res) => {
    try {
        const { date } = req.body;
        const employee = await Employee.findOne({ email: req.user.email });
        if (!employee) return res.status(404).json({ message: 'No Employee profile linked to this account' });

        let attendance = await Attendance.findOne({ employeeId: employee._id, date });
        if (attendance) return res.status(400).json({ message: 'Already checked in for today' });

        // Mark as Late if after 09:30
        const hour = new Date().getHours();
        const min  = new Date().getMinutes();
        const isLate = hour > 9 || (hour === 9 && min > 30);

        attendance = await Attendance.create({
            employeeId: employee._id,
            date,
            checkIn: new Date(),
            status: isLate ? 'Late' : 'Present'
        });

        res.status(201).json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const { date } = req.body;
        const employee = await Employee.findOne({ email: req.user.email });
        if (!employee) return res.status(404).json({ message: 'No Employee profile linked to this account' });

        let attendance = await Attendance.findOne({ employeeId: employee._id, date });
        if (!attendance) return res.status(404).json({ message: 'No check-in found for today' });
        if (attendance.checkOut) return res.status(400).json({ message: 'Already checked out' });

        attendance.checkOut = new Date();
        const diff = Math.abs(attendance.checkOut - attendance.checkIn);
        attendance.hoursWorked = parseFloat((diff / (1000 * 60 * 60)).toFixed(2));

        await attendance.save();
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
