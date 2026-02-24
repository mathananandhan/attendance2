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

        // 2. Student Performance List
        const studentPerformance = await Attendance.aggregate([
            { $match: { classId: new mongoose.Types.ObjectId(classId) } },
            {
                $group: {
                    _id: "$studentId",
                    avgScore: { $avg: "$attentionScore" },
                    attendanceCount: { $sum: 1 }
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
                    attendance: "$attendanceCount",
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
