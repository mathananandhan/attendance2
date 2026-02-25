const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const mongoose = require('mongoose');

// @desc    Get Class Analytics (Attendance & Attention)
// @route   GET /api/analytics/class/:classId
// @access  Private (Teacher)
exports.getClassAnalytics = async (req, res) => {
    try {
        const { classId } = req.params;

        // Check if teacher owns the class (optional security)

        // 1. Average Attention Score per day
        const attentionTrend = await Attendance.aggregate([
            { $match: { classId: new mongoose.Types.ObjectId(classId) } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    avgAttention: { $avg: "$attentionScore" },
                    totalStudents: { $sum: 1 } // Distinct students would be better if multiple records per day
                }
            },
            { $project: { date: "$_id", avgAttention: 1, students: "$totalStudents", _id: 0 } },
            { $sort: { date: 1 } } // Sort by date
        ]);

        // Find total distinct sessions for this class
        const distinctSessions = await Attendance.distinct("date", { classId: new mongoose.Types.ObjectId(classId) });
        const totalSessions = distinctSessions.length || 1; // Prevent division by zero

        // 2. Student Performance List
        const studentPerformance = await Attendance.aggregate([
            { $match: { classId: new mongoose.Types.ObjectId(classId) } },
            {
                $group: {
                    _id: "$studentId",
                    avgScore: { $avg: "$attentionScore" },
                    // Count only if status is present or late
                    attendanceCount: {
                        $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "student"
                }
            },
            { $unwind: "$student" },
            {
                $project: {
                    name: "$student.name",
                    score: { $round: ["$avgScore", 0] },
                    // Calculate percentage: (Attended / Total Sessions) * 100
                    attendanceRate: {
                        $round: [{ $multiply: [{ $divide: ["$attendanceCount", totalSessions] }, 100] }, 0]
                    },
                    attendanceCount: "$attendanceCount",
                    _id: 0
                }
            }
        ]);

        res.json({ attentionTrend, studentPerformance });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Admin Analytics (Overall System Stats)
// @route   GET /api/analytics/admin
// @access  Private (Admin)
exports.getAdminAnalytics = async (req, res) => {
    try {
        const User = require('../models/User');
        const Department = require('../models/Department');

        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTeachers = await User.countDocuments({ role: { $in: ['teacher', 'faculty'] } });
        const totalDepartments = await Department.countDocuments({});
        const totalClasses = await Class.countDocuments({});

        // Calculate platform-wide average attention
        const overallAttention = await Attendance.aggregate([
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: "$attentionScore" }
                }
            }
        ]);

        const avgAttentionScore = overallAttention.length > 0 ? overallAttention[0].avgScore : 0;

        res.json({
            totalStudents,
            totalTeachers,
            totalDepartments,
            totalClasses,
            avgAttentionScore: Math.round(avgAttentionScore)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
