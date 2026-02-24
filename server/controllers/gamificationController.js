const Gamification = require('../models/Gamification');
const { createNotification } = require('./notificationController');

// Badge definitions
const BADGE_DEFINITIONS = [
    { name: 'First Steps', description: 'Earned your first 10 points', icon: '🌟', threshold: 10 },
    { name: 'Scholar', description: 'Earned 100 points', icon: '📚', threshold: 100 },
    { name: 'Dedicated', description: 'Earned 500 points', icon: '🎯', threshold: 500 },
    { name: 'Elite', description: 'Earned 1000 points', icon: '💎', threshold: 1000 },
    { name: 'Legend', description: 'Earned 5000 points', icon: '👑', threshold: 5000 },
    { name: 'Week Warrior', description: '7-day attendance streak', icon: '🔥', streakThreshold: 7 },
    { name: 'Month Master', description: '30-day attendance streak', icon: '⚡', streakThreshold: 30 },
];

// Helper: Get or create gamification profile
const getOrCreateProfile = async (userId) => {
    let profile = await Gamification.findOne({ userId });
    if (!profile) {
        profile = await Gamification.create({ userId });
    }
    return profile;
};

// Helper: Check and award badges
const checkBadges = async (profile) => {
    const newBadges = [];
    const existingNames = profile.badges.map(b => b.name);

    for (const badge of BADGE_DEFINITIONS) {
        if (existingNames.includes(badge.name)) continue;

        if (badge.threshold && profile.points >= badge.threshold) {
            newBadges.push({ name: badge.name, description: badge.description, icon: badge.icon });
        }
        if (badge.streakThreshold && profile.streaks.current >= badge.streakThreshold) {
            newBadges.push({ name: badge.name, description: badge.description, icon: badge.icon });
        }
    }

    if (newBadges.length > 0) {
        profile.badges.push(...newBadges);
        await profile.save();

        // Notify user of new badges
        for (const badge of newBadges) {
            await createNotification(
                profile.userId,
                'New Badge Earned! ' + badge.icon,
                `You earned the "${badge.name}" badge: ${badge.description}`,
                'achievement'
            );
        }
    }
    return newBadges;
};

// @desc    Get my gamification profile
// @route   GET /api/gamification/me
// @access  Private
exports.getMyGamification = async (req, res) => {
    try {
        const profile = await getOrCreateProfile(req.user._id);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Gamification.find({})
            .populate('userId', 'name avatar department year')
            .sort({ points: -1 })
            .limit(50);
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Award points to a user (internal helper, also exposed as endpoint for admin)
// @route   POST /api/gamification/award
// @access  Private
exports.awardPoints = async (userId, points, reason = 'Activity') => {
    try {
        const profile = await getOrCreateProfile(userId);
        profile.points += points;

        // Level up every 100 points
        profile.level = Math.floor(profile.points / 100) + 1;

        await profile.save();
        await checkBadges(profile);
        return profile;
    } catch (error) {
        console.error('Error awarding points:', error.message);
    }
};

// @desc    Update attendance streak
exports.updateStreak = async (userId) => {
    try {
        const profile = await getOrCreateProfile(userId);
        const today = new Date().toDateString();
        const lastActive = profile.streaks.lastActiveDate
            ? profile.streaks.lastActiveDate.toDateString()
            : null;

        if (lastActive === today) return profile; // Already active today

        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (lastActive === yesterday) {
            profile.streaks.current += 1;
        } else {
            profile.streaks.current = 1;
        }

        if (profile.streaks.current > profile.streaks.longest) {
            profile.streaks.longest = profile.streaks.current;
        }

        profile.streaks.lastActiveDate = new Date();
        await profile.save();
        await checkBadges(profile);
        return profile;
    } catch (error) {
        console.error('Error updating streak:', error.message);
    }
};
