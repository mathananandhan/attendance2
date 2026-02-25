const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }, // Optional, could be for general class
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    type: { type: String, enum: ['tab_switch', 'fullscreen_exit', 'no_face', 'multiple_faces', 'mobile_phone_detected'], required: true },
    timestamp: { type: Date, default: Date.now },
    snapshotUrl: { type: String }, // URL to snapshot of violation
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' }
});

module.exports = mongoose.model('Violation', violationSchema);
