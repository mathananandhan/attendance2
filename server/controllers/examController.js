const Exam = require('../models/Exam');

// @desc    Create a new exam
// @route   POST /api/exams
// @access  Private (Teacher/Admin)
const createExam = async (req, res) => {
    try {
        const { classId, title, description, startTime, duration, questions, proctoringConfig } = req.body;

        const exam = new Exam({
            classId,
            title,
            description,
            startTime,
            duration,
            questions,
            isActive: true, // Auto activate for now
            proctoringConfig: proctoringConfig || { requireCamera: true, blockTabSwitch: true }
        });

        const createdExam = await exam.save();
        res.status(201).json({ success: true, data: createdExam });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all exams for a specific class
// @route   GET /api/exams/class/:classId
// @access  Private
const getClassExams = async (req, res) => {
    try {
        const exams = await Exam.find({ classId: req.params.classId }).sort('-createdAt');
        res.status(200).json({ success: true, data: exams });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Private
const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        res.status(200).json({ success: true, data: exam });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createExam,
    getClassExams,
    getExamById
};
