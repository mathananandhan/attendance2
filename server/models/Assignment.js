const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    title: { type: String, required: true },
    topic: { type: String }, // Linked to the day's teaching topic
    description: { type: String },
    dueDate: { type: Date, required: true },
    submissions: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String }, // Link to file or text
        submittedAt: { type: Date, default: Date.now },
        grade: { type: Number },
        feedback: { type: String }
    }]
});

module.exports = mongoose.model('Assignment', assignmentSchema);
