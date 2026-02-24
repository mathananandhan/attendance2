const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');

// @desc    Get a student's full report
// @route   GET /api/reports/student/:studentId
// @access  Private (Teacher/Admin or self)
exports.getStudentReport = async (req, res) => {
    try {
        const studentId = req.params.studentId;

        // Check authorization
        if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const student = await User.findById(studentId).select('-password');
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Get attendance records
        const attendance = await Attendance.find({ studentId }).populate('classId', 'title');
        const totalClasses = attendance.length;
        const presentClasses = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
        const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

        // Average attention score
        const avgAttention = totalClasses > 0
            ? Math.round(attendance.reduce((sum, a) => sum + (a.attentionScore || 0), 0) / totalClasses)
            : 0;

        // Get assignments
        const classes = await Class.find({
            $or: [{ students: studentId }, { teacher: studentId }]
        });
        const classIds = classes.map(c => c._id);

        const assignments = await Assignment.find({ classId: { $in: classIds } });
        let totalGraded = 0, totalGrade = 0;
        assignments.forEach(a => {
            const submission = a.submissions.find(s => s.studentId?.toString() === studentId);
            if (submission && submission.grade !== undefined) {
                totalGraded++;
                totalGrade += submission.grade;
            }
        });
        const avgGrade = totalGraded > 0 ? Math.round(totalGrade / totalGraded) : null;

        // Attention trend (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentAttendance = attendance
            .filter(a => a.date >= thirtyDaysAgo)
            .sort((a, b) => a.date - b.date)
            .map(a => ({
                date: a.date.toLocaleDateString(),
                attention: a.attentionScore || 0,
                status: a.status
            }));

        res.json({
            student: {
                name: student.name,
                email: student.email,
                department: student.department,
                year: student.year
            },
            summary: {
                attendanceRate,
                avgAttention,
                avgGrade,
                totalClasses,
                presentClasses
            },
            trend: recentAttendance,
            classes: classes.map(c => ({ _id: c._id, title: c.title }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export attendance as CSV
// @route   GET /api/reports/attendance/export/:classId
// @access  Private (Teacher/Admin)
exports.exportAttendanceCSV = async (req, res) => {
    try {
        const attendance = await Attendance.find({ classId: req.params.classId })
            .populate('studentId', 'name email department year')
            .sort({ date: -1 });

        // Build CSV
        let csv = 'Student Name,Email,Department,Year,Date,Status,Attention Score\n';
        attendance.forEach(a => {
            csv += `"${a.studentId?.name || 'N/A'}","${a.studentId?.email || 'N/A'}","${a.studentId?.department || ''}","${a.studentId?.year || ''}","${a.date?.toLocaleDateString() || ''}","${a.status}","${a.attentionScore || 0}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendance_${req.params.classId}.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
