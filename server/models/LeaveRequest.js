const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, enum: ['Sick', 'Casual', 'Annual', 'Other'], required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
