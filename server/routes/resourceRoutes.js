const express = require('express');
const router = express.Router();
const { getClassResources, uploadResource, deleteResource } = require('../controllers/resourceController');
const { protect, teacher } = require('../middleware/authMiddleware');

router.get('/class/:classId', protect, getClassResources);
router.post('/', protect, teacher, uploadResource);
router.delete('/:id', protect, teacher, deleteResource);

module.exports = router;
