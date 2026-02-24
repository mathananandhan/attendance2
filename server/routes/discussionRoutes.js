const express = require('express');
const router = express.Router();
const { getDiscussions, createDiscussion, addReply, upvoteDiscussion } = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/class/:classId', protect, getDiscussions);
router.post('/', protect, createDiscussion);
router.post('/:id/reply', protect, addReply);
router.put('/:id/upvote', protect, upvoteDiscussion);

module.exports = router;
