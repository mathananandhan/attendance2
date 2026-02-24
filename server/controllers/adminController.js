const User = require('../models/User');
const Class = require('../models/Class');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a Teacher
// @route   POST /api/admin/create-teacher
// @access  Private/Admin
exports.createTeacher = async (req, res) => {
    const { name, email, password, department } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'teacher',
            department
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all classes
// @route   GET /api/admin/classes
// @access  Private/Admin
exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Class.find({}).populate('teacher', 'name email');
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign Teacher to Class
// @route   PUT /api/admin/assign-teacher
// @access  Private/Admin
exports.assignTeacherToClass = async (req, res) => {
    const { classId, teacherId } = req.body;

    try {
        const classroom = await Class.findById(classId);
        if (!classroom) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(400).json({ message: 'Invalid teacher ID' });
        }

        classroom.teacher = teacherId;
        await classroom.save();

        res.json({ message: 'Teacher assigned successfully', classroom });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
