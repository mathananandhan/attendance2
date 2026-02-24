const Attendance = require('../models/Attendance');
const { awardPoints, updateStreak } = require('./gamificationController');
const { createNotification } = require('./notificationController');

// @desc    Record or Update Attendance/Attention
// @route   POST /api/attendance/record
// @access  Private (Student)
exports.recordAttendance = async (req, res) => {
    const { classId, status, attentionScore, flags } = req.body;
    const studentId = req.user._id;

    try {
        // Find today's attendance for this student and class
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));

        let attendance = await Attendance.findOne({
            classId,
            studentId,
            date: { $gte: startOfDay }
        });

        let isNew = false;

        if (attendance) {
            // Update existing record
            const oldScore = attendance.attentionScore || 100;
            const newScore = (oldScore + attentionScore) / 2;

            attendance.attentionScore = newScore;
            if (flags && flags.length > 0) {
                attendance.proctoringFlags.push(...flags.map(f => ({ type: f, timestamp: new Date() })));
            }
            attendance.status = status || attendance.status;
            await attendance.save();
        } else {
            // Create new record
            isNew = true;
            attendance = await Attendance.create({
                classId,
                studentId,
                status: status || 'present',
                attentionScore: attentionScore || 100,
                proctoringFlags: flags ? flags.map(f => ({ type: f, timestamp: new Date() })) : []
            });
        }

        // Gamification: award points for attendance and update streak
        if (isNew) {
            await awardPoints(studentId, 10, 'Class attendance');
            await updateStreak(studentId);

            // High attention bonus
            if (attentionScore >= 90) {
                await awardPoints(studentId, 5, 'High attention score');
            }
        }

        res.status(200).json(attendance);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Attendance for a Student
// @route   GET /api/attendance/my
// @access  Private
exports.getMyAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ studentId: req.user._id }).populate('classId', 'title');
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
