const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
    attentionScore: { type: Number, default: 0 }, // Average attention score (0-100)
    proctoringFlags: [{
        timestamp: { type: Date, default: Date.now },
        type: { type: String }, // e.g., "looking_away", "no_face", "multiple_faces"
        snapshotUrl: { type: String }
    }]
});

module.exports = mongoose.model('Attendance', attendanceSchema);
