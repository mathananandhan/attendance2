const express = require('express');
const router = express.Router();
const { createAssignment, getClassAssignments, submitAssignment, gradeAssignment } = require('../controllers/assignmentController');
const { protect, teacher } = require('../middleware/authMiddleware');

router.post('/', protect, teacher, createAssignment);
router.get('/:classId', protect, getClassAssignments);
router.post('/:id/submit', protect, submitAssignment);
router.put('/:id/grade/:studentId', protect, teacher, gradeAssignment);

module.exports = router;
