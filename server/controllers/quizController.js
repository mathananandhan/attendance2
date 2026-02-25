const QuizResult = require('../models/QuizResult');
const { awardPoints, updateStreak } = require('./gamificationController');

// @desc    Submit Quiz Score
// @route   POST /api/quizzes/submit
// @access  Private (Student)
exports.submitQuiz = async (req, res) => {
    const { classId, quizTopic, score, totalPoints } = req.body;
    const studentId = req.user._id;

    try {
        const quizResult = await QuizResult.create({
            classId,
            studentId,
            quizTopic,
            score,
            totalPoints
        });

        // Gamification: Award 5 points per correct answer
        if (score > 0) {
            await awardPoints(studentId, score * 5, `Quiz score: ${quizTopic}`);
        }
        await updateStreak(studentId);

        res.status(201).json(quizResult);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Student Quiz Results
// @route   GET /api/quizzes/my
// @access  Private (Student)
exports.getMyQuizzes = async (req, res) => {
    try {
        const quizzes = await QuizResult.find({ studentId: req.user._id }).populate('classId', 'title');
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Class Quiz Results
// @route   GET /api/quizzes/class/:id
// @access  Private (Teacher/Faculty)
exports.getClassQuizzes = async (req, res) => {
    try {
        const quizzes = await QuizResult.find({ classId: req.params.id }).populate('studentId', 'name email');
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
