const express = require('express');
const { getClassAnalytics, getAdminAnalytics } = require('../controllers/analyticsController');
const { protect, teacher, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/class/:classId', protect, teacher, getClassAnalytics);
router.get('/admin', protect, admin, getAdminAnalytics);

module.exports = router;
