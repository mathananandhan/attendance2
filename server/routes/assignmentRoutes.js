const express = require('express');
const router = express.Router();
const { createAssignment, getClassAssignments, submitAssignment } = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createAssignment);
router.get('/:classId', protect, getClassAssignments);
router.post('/:id/submit', protect, submitAssignment);

module.exports = router;
