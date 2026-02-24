const express = require('express');
const router = express.Router();
const { getStudentReport, exportAttendanceCSV } = require('../controllers/reportController');
const { protect, teacher } = require('../middleware/authMiddleware');

router.get('/student/:studentId', protect, getStudentReport);
router.get('/attendance/export/:classId', protect, teacher, exportAttendanceCSV);

module.exports = router;
