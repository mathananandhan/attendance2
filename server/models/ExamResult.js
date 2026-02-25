const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number },
    cheatingScore: { type: Number, default: 0 },
    violationsCount: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['completed', 'auto-submitted', 'disqualified'], default: 'completed' }
});

module.exports = mongoose.model('ExamResult', examResultSchema);
