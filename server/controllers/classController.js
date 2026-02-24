const Class = require('../models/Class');

// @desc    Get classes for the logged-in user
// @route   GET /api/classes/my
// @access  Private
exports.getMyClasses = async (req, res) => {
    try {
        let classes;
        if (req.user.role === 'admin') {
            classes = await Class.find().populate('teacher', 'name').populate('students', 'name');
        } else if (req.user.role === 'teacher') {
            classes = await Class.find({ teacher: req.user._id }).populate('teacher', 'name').populate('students', 'name');
        } else {
            // Student
            classes = await Class.find({ students: req.user._id }).populate('teacher', 'name');
        }
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single class by ID
// @route   GET /api/classes/:id
// @access  Private
exports.getClassById = async (req, res) => {
    try {
        const cls = await Class.findById(req.params.id).populate('teacher', 'name').populate('students', 'name');
        if (cls) {
            res.json(cls);
        } else {
            res.status(404).json({ message: 'Class not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Teacher/Admin)
exports.createClass = async (req, res) => {
    try {
        const { title, department, year, description, schedule } = req.body;

        // Generate a random 6-character code
        const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const newClass = await Class.create({
            title,
            department,
            year,
            description,
            teacher: req.user._id,
            schedule,
            joinCode,
            students: []
        });

        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join a class via code
// @route   POST /api/classes/join
// @access  Private (Student)
exports.joinClass = async (req, res) => {
    try {
        const { code } = req.body;
        const cls = await Class.findOne({ joinCode: code });

        if (!cls) {
            return res.status(404).json({ message: 'Invalid class code' });
        }

        if (cls.students.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already enrolled in this class' });
        }

        cls.students.push(req.user._id);
        await cls.save();

        res.json({ message: 'Successfully joined class', classId: cls._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
