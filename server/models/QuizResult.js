const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizTopic: { type: String }, // e.g., 'Array Basics'
    score: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    answeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
