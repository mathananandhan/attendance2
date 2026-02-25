const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

// Import all models
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const QuizResult = require('../models/QuizResult');
const LiveNote = require('../models/LiveNote');
const Violation = require('../models/Violation');
const Gamification = require('../models/Gamification');
const Discussion = require('../models/Discussion');
const Notification = require('../models/Notification');
const Resource = require('../models/Resource');

async function wipeData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        console.log("Wiping all existing classes and associated dummy data...");
        await Class.deleteMany({});
        await Attendance.deleteMany({});
        await Assignment.deleteMany({});
        await Submission.deleteMany({});
        await Exam.deleteMany({});
        await ExamResult.deleteMany({});
        await QuizResult.deleteMany({});
        await LiveNote.deleteMany({});
        await Violation.deleteMany({});
        await Gamification.deleteMany({});
        await Discussion.deleteMany({});
        await Notification.deleteMany({});
        await Resource.deleteMany({});

        console.log("Successfully removed all dummy learning data. System is now clean for real-time data.");
        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("Error clearing data:", err);
        process.exit(1);
    }
}

wipeData();
