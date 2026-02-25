const mongoose = require('mongoose');

const liveNoteSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    content: { type: String, required: true }, // The summarized AI notes
    rawTranscript: { type: String }, // Optional: raw speech-to-text transcript
    generatedAt: { type: Date, default: Date.now },
    pdfUrl: { type: String } // URL to download notes as PDF
});

module.exports = mongoose.model('LiveNote', liveNoteSchema);
