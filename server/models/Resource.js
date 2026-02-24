const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'video', 'document', 'slides', 'link', 'other'], default: 'other' }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
