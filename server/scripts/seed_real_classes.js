const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Exam = require('../models/Exam');
const Gamification = require('../models/Gamification');

async function seedRealData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for Real Data Seeding...");

        console.log("Cleaning up any existing real teachers or gamification data to avoid duplicates...");
        await User.deleteMany({ role: 'teacher' });
        await Class.deleteMany({});
        await Attendance.deleteMany({});
        await Gamification.deleteMany({});
        await Assignment.deleteMany({});

        // 1. Create Real Teachers
        console.log("Creating Teachers...");
        const teacherPass = await bcrypt.hash('Teacher@123', 10);

        const teacher1 = new User({
            name: 'Dr. Emily Chen',
            email: 'emily.chen@eduprime.edu',
            password: 'Teacher@123', // Model hook will hash
            role: 'teacher',
            department: 'AIML'
        });

        const teacher2 = new User({
            name: 'Prof. Alan Turing',
            email: 'alan.turing@eduprime.edu',
            password: 'Teacher@123',
            role: 'teacher',
            department: 'AIML'
        });

        await teacher1.save();
        await teacher2.save();
        console.log(`Teachers Created: ${teacher1.name}, ${teacher2.name}`);

        // 2. Fetch all AIML 3rd Year Students
        const students = await User.find({ role: 'student', department: 'AIML' });
        console.log(`Found ${students.length} AIML Students.`);
        const studentIds = students.map(s => s._id);

        // 3. Create Real Classes
        console.log("Creating Classes...");
        const class1 = new Class({
            title: 'Artificial Intelligence - CS802',
            department: 'AIML',
            year: '3',
            section: 'A',
            description: 'Core AI concepts, search algorithms, and logic.',
            teacher: teacher1._id,
            students: studentIds, // Enrolling all 57 students
            schedule: [{ day: 'Monday', startTime: '10:00 AM', endTime: '11:30 AM' }, { day: 'Wednesday', startTime: '10:00 AM', endTime: '11:30 AM' }],
            joinCode: 'AI-CORE-3A'
        });

        const class2 = new Class({
            title: 'Machine Learning Lab - CS803L',
            department: 'AIML',
            year: '3',
            section: 'A',
            description: 'Practical implementations of ML models using Python.',
            teacher: teacher2._id,
            students: studentIds,
            schedule: [{ day: 'Tuesday', startTime: '01:00 PM', endTime: '04:00 PM' }],
            joinCode: 'ML-LAB-3A'
        });

        await class1.save();
        await class2.save();
        console.log(`Created Classes: ${class1.title}, ${class2.title}`);

        // 4. Generate Realistic Historical Attendance (Past 5 sessions per class)
        console.log("Generating Historical Attendance...");
        const classes = [class1, class2];
        let attendanceDocs = [];
        let gamificationDocs = [];

        // For each student, initialize a Gamification profile
        for (let student of students) {
            let xp = 0;

            for (let c of classes) {
                // Generate 5 past dates
                for (let i = 1; i <= 5; i++) {
                    const sessionDate = new Date();
                    sessionDate.setDate(sessionDate.getDate() - (i * 2)); // Go back in days

                    // 90% chance to be present
                    const isPresent = Math.random() > 0.1;
                    const status = isPresent ? 'present' : 'absent';
                    const attScore = isPresent ? Math.floor(Math.random() * (100 - 70 + 1) + 70) : 0; // 70-100% active if present

                    attendanceDocs.push({
                        classId: c._id,
                        studentId: student._id,
                        date: sessionDate,
                        joinTime: isPresent ? sessionDate : null,
                        leaveTime: null,
                        cameraOn: isPresent,
                        status: status,
                        attentionScore: attScore,
                        proctoringFlags: []
                    });

                    if (isPresent) xp += 10;
                }
            }

            // Add Gamification doc
            gamificationDocs.push({
                userId: student._id,
                points: xp,
                level: Math.floor(xp / 50) + 1,
                badges: xp > 80 ? [{ name: 'Consistent Learner', description: 'Maintained high attendance.', icon: '🔥', earnedAt: new Date() }] : []
            });
        }

        await Attendance.insertMany(attendanceDocs);
        await Gamification.insertMany(gamificationDocs);
        console.log(`Generated ${attendanceDocs.length} Attendance Records and Leaderboard profiles.`);

        // 5. Generate a couple of Assignments
        console.log("Creating Assignments...");
        const hw1 = new Assignment({
            classId: class1._id,
            title: 'Implement A* Search',
            topic: 'Search Algorithms',
            description: 'Write a Python script to solve an 8-puzzle using A* search heuristic.',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next week
        });
        await hw1.save();

        console.log("Real Data Seeding Complete! System ready for use.");
        process.exit(0);

    } catch (err) {
        console.error("Error generating real data:", err);
        process.exit(1);
    }
}

seedRealData();
