const express = require('express');
const { recordAttendance, getMyAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/record', protect, recordAttendance);
router.get('/my', protect, getMyAttendance);

module.exports = router;
