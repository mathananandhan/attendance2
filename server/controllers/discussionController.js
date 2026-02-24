const Discussion = require('../models/Discussion');
const { createNotification } = require('./notificationController');
const Class = require('../models/Class');

// @desc    Get discussions for a class
// @route   GET /api/discussions/class/:classId
// @access  Private
exports.getDiscussions = async (req, res) => {
    try {
        const discussions = await Discussion.find({ classId: req.params.classId })
            .populate('authorId', 'name avatar role')
            .populate('replies.authorId', 'name avatar role')
            .sort({ isPinned: -1, createdAt: -1 });
        res.json(discussions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a discussion thread
// @route   POST /api/discussions
// @access  Private
exports.createDiscussion = async (req, res) => {
    const { classId, title, content } = req.body;
    try {
        const discussion = await Discussion.create({
            classId,
            authorId: req.user._id,
            title,
            content
        });
        const populated = await discussion.populate('authorId', 'name avatar role');

        // Notify class teacher
        const cls = await Class.findById(classId);
        if (cls && cls.teacher) {
            await createNotification(
                cls.teacher,
                'New Discussion',
                `${req.user.name} posted "${title}" in ${cls.title}`,
                'discussion',
                `/dashboard/discussions/${classId}`
            );
        }

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add reply to a discussion
// @route   POST /api/discussions/:id/reply
// @access  Private
exports.addReply = async (req, res) => {
    const { content } = req.body;
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

        discussion.replies.push({ authorId: req.user._id, content });
        await discussion.save();

        const populated = await discussion
            .populate('authorId', 'name avatar role');
        await Discussion.populate(populated, { path: 'replies.authorId', select: 'name avatar role' });

        // Notify the original author
        if (discussion.authorId.toString() !== req.user._id.toString()) {
            await createNotification(
                discussion.authorId,
                'New Reply',
                `${req.user.name} replied to your discussion "${discussion.title}"`,
                'discussion'
            );
        }

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle upvote on a discussion
// @route   PUT /api/discussions/:id/upvote
// @access  Private
exports.upvoteDiscussion = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

        const idx = discussion.upvotes.indexOf(req.user._id);
        if (idx > -1) {
            discussion.upvotes.splice(idx, 1);
        } else {
            discussion.upvotes.push(req.user._id);
        }
        await discussion.save();
        res.json({ upvotes: discussion.upvotes.length, upvoted: idx === -1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
