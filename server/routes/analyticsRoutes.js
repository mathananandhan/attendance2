const express = require('express');
const { getClassAnalytics } = require('../controllers/analyticsController');
const { protect, teacher } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/class/:classId', protect, teacher, getClassAnalytics);

module.exports = router;
