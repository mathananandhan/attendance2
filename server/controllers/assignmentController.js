const Assignment = require('../models/Assignment');
const Class = require('../models/Class');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private (Teacher only)
exports.createAssignment = async (req, res) => {
    const { classId, title, topic, description, dueDate } = req.body;

    try {
        const assignment = await Assignment.create({
            classId,
            title,
            topic,
            description,
            dueDate
        });
        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assignments for a class
// @route   GET /api/assignments/:classId
// @access  Private
exports.getClassAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ classId: req.params.classId }).sort({ dueDate: 1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit assignment (Student)
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
exports.submitAssignment = async (req, res) => {
    const { content } = req.body;
    const studentId = req.user._id;

    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check if already submitted
        const existingSubmission = assignment.submissions.find(s => s.studentId.toString() === studentId.toString());

        if (existingSubmission) {
            existingSubmission.content = content;
            existingSubmission.submittedAt = Date.now();
        } else {
            assignment.submissions.push({
                studentId,
                content,
                submittedAt: Date.now()
            });
        }

        await assignment.save();
        res.json({ message: 'Assignment submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Grade Assignment (Teacher/Faculty)
// @route   PUT /api/assignments/:id/grade/:studentId
// @access  Private (Teacher)
exports.gradeAssignment = async (req, res) => {
    const { grade, feedback } = req.body;
    const { id, studentId } = req.params;

    try {
        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const submission = assignment.submissions.find(s => s.studentId.toString() === studentId.toString());
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found for this student' });
        }

        submission.grade = grade;
        submission.feedback = feedback;

        await assignment.save();
        res.json({ message: 'Assignment graded successfully', submission });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
