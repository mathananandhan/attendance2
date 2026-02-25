const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const Violation = require('../models/Violation');
const { awardPoints, updateStreak } = require('./gamificationController');

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

// @desc    Log an exam violation
// @route   POST /api/exams/:id/violation
// @access  Private
const logViolation = async (req, res) => {
    try {
        const { type, severity } = req.body;
        const examId = req.params.id;
        const studentId = req.user._id;

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        const violation = new Violation({
            studentId,
            examId,
            classId: exam.classId,
            type,
            severity
        });

        await violation.save();
        res.status(201).json({ success: true, data: violation });
    } catch (error) {
        console.error("Error logging violation:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Submit an exam and calculate score
// @route   POST /api/exams/:id/submit
// @access  Private
const submitExam = async (req, res) => {
    try {
        const { answers, warningsCount } = req.body;
        const examId = req.params.id;
        const studentId = req.user._id;

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        // Calculate Score
        let score = 0;
        exam.questions.forEach((q, index) => {
            const studentAnswer = answers[index];
            if (studentAnswer === q.options[q.correctOption]) {
                score += 1;
            }
        });

        // Get actual violations from DB to calculate cheating score
        const violations = await Violation.find({ examId, studentId });
        let cheatingScore = 0;
        violations.forEach(v => {
            if (v.severity === 'critical') cheatingScore += 40;
            else if (v.severity === 'high') cheatingScore += 20;
            else if (v.severity === 'medium') cheatingScore += 10;
            else cheatingScore += 5;
        });

        // Fallback to client warnings if DB missed some
        const totalViolationsCount = Math.max(violations.length, warningsCount || 0);
        if (violations.length === 0 && warningsCount > 0) {
            cheatingScore += warningsCount * 10; // estimate
        }

        const isDisqualified = cheatingScore >= 100;

        const examResult = new ExamResult({
            examId,
            studentId,
            score,
            totalQuestions: exam.questions.length,
            cheatingScore,
            violationsCount: totalViolationsCount,
            status: isDisqualified ? 'disqualified' : 'completed'
        });

        await examResult.save();

        if (!isDisqualified && score > 0) {
            await awardPoints(studentId, score * 10, `Exam completion: ${exam.title}`);
            await updateStreak(studentId);
        }

        res.status(201).json({ success: true, data: examResult });
    } catch (error) {
        console.error("Error submitting exam:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createExam,
    getClassExams,
    getExamById,
    submitExam,
    logViolation
};
