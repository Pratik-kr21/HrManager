const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
    joinDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Active', 'On Leave'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
