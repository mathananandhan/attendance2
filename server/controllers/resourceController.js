const Resource = require('../models/Resource');
const { createNotification } = require('./notificationController');
const Class = require('../models/Class');

// @desc    Get resources for a class
// @route   GET /api/resources/class/:classId
// @access  Private
exports.getClassResources = async (req, res) => {
    try {
        const resources = await Resource.find({ classId: req.params.classId })
            .populate('uploadedBy', 'name role')
            .sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload/create a resource (URL-based)
// @route   POST /api/resources
// @access  Private (Teacher)
exports.uploadResource = async (req, res) => {
    const { classId, title, description, fileUrl, fileType } = req.body;
    try {
        const resource = await Resource.create({
            classId,
            uploadedBy: req.user._id,
            title,
            description,
            fileUrl,
            fileType: fileType || 'other'
        });

        // Notify students in the class
        const cls = await Class.findById(classId).populate('students');
        if (cls && cls.students) {
            for (const student of cls.students) {
                await createNotification(
                    student._id,
                    'New Resource',
                    `${req.user.name} shared "${title}" in ${cls.title}`,
                    'system',
                    `/dashboard/resources/${classId}`
                );
            }
        }

        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private (Teacher/Admin)
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Resource.findByIdAndDelete(req.params.id);
        res.json({ message: 'Resource deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
