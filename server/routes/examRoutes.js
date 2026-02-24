const express = require('express');
const router = express.Router();
const { createExam, getClassExams, getExamById } = require('../controllers/examController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createExam);
router.get('/class/:classId', protect, getClassExams);
router.get('/:id', protect, getExamById);

module.exports = router;
