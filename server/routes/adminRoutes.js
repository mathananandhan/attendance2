const express = require('express');
const router = express.Router();
const { getAllUsers, createTeacher, getAllClasses, assignTeacherToClass } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// Middleware to check for admin role
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

router.get('/users', protect, admin, getAllUsers);
router.post('/create-teacher', protect, admin, createTeacher);
router.get('/classes', protect, admin, getAllClasses);
router.put('/assign-teacher', protect, admin, assignTeacherToClass);

module.exports = router;
