const express = require('express');
const router = express.Router();
const { submitQuiz, getMyQuizzes, getClassQuizzes } = require('../controllers/quizController');
const { protect, teacher, faculty } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitQuiz);
router.get('/my', protect, getMyQuizzes);
router.get('/class/:id', protect, teacher, getClassQuizzes); // Both teacher and faculty covered by 'teacher' role in authMiddleware if updated correctly

module.exports = router;
