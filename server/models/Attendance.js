const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    checkIn: { type: Date },
    checkOut: { type: Date },
    hoursWorked: { type: Number, default: 0 },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
