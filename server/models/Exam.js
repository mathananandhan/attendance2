const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes
    questions: [{
        questionText: { type: String, required: true },
        options: [{ type: String }],
        correctOption: { type: Number }, // Index of correct option
        points: { type: Number, default: 1 }
    }],
    isActive: { type: Boolean, default: false },
    proctoringConfig: {
        requireCamera: { type: Boolean, default: true },
        blockTabSwitch: { type: Boolean, default: true }
    }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
