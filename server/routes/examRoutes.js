const express = require('express');
const router = express.Router();
const { createExam, getClassExams, getExamById, submitExam, logViolation } = require('../controllers/examController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createExam);
router.get('/class/:classId', protect, getClassExams);
router.get('/:id', protect, getExamById);
router.post('/:id/submit', protect, submitExam);
router.post('/:id/violation', protect, logViolation);

module.exports = router;
