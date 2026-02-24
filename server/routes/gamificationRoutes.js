const express = require('express');
const router = express.Router();
const { getMyGamification, getLeaderboard } = require('../controllers/gamificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyGamification);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
