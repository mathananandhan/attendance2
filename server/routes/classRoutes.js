const express = require('express');
const { getMyClasses, getClassById, createClass, joinClass } = require('../controllers/classController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/my', protect, getMyClasses);
router.post('/join', protect, joinClass);
router.post('/', protect, createClass);
router.get('/:id', protect, getClassById);

module.exports = router;
