const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Import all models
const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const QuizResult = require('../models/QuizResult');
const Gamification = require('../models/Gamification');
const Discussion = require('../models/Discussion');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function seedMaster() {
    try {
        console.log("Connecting to MongoDB for Master Seeding...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected Successfully.");

        console.log("Wiping existing collections...");
        await User.deleteMany({ role: { $in: ['student', 'teacher', 'admin'] } });
        await Class.deleteMany({});
        await Attendance.deleteMany({});
        await Assignment.deleteMany({});
        await Exam.deleteMany({});
        await QuizResult.deleteMany({});
        await Gamification.deleteMany({});
        await Discussion.deleteMany({});
        console.log("Collections wiped.");

        // 1. Create Admin
        const adminPass = await bcrypt.hash('Admin@123', 10);
        const adminUser = new User({
            name: 'System Admin',
            email: 'admin@eduprime.edu',
            password: 'Admin@123', // PWD string since schema pre-save handles it
            role: 'admin',
            department: 'Administration'
        });
        await adminUser.save();
        console.log("Admin seeded.");

        // 2. Create Teacher
        const teacherUser = new User({
            name: 'Prof. Alan Turing',
            email: 'alan.turing@demo.com',
            password: 'password123',
            role: 'teacher',
            department: 'AIML'
        });
        await teacherUser.save();
        console.log("Teacher seeded.");

        // 3. Create Students
        const students = [];
        const studentNames = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Evan Wright'];
        for (let i = 0; i < studentNames.length; i++) {
            const student = new User({
                name: studentNames[i],
                email: `student${i + 1}@demo.com`,
                password: 'password123',
                role: 'student',
                rollNumber: `AIML2023${100 + i}`,
                department: 'AIML',
                year: 'III'
            });
            await student.save();
            students.push(student);
        }
        console.log("Students seeded.");

        // 4. Create Class with Timetable
        const newClass = new Class({
            title: 'Advanced Machine Learning',
            department: 'AIML',
            year: 'III',
            section: 'A',
            description: 'Deep Learning, Neural Networks and AI architectures.',
            teacher: teacherUser._id,
            students: students.map(s => s._id),
            schedule: [
                { day: 'Monday', startTime: '09:00 AM', endTime: '10:30 AM' },
                { day: 'Wednesday', startTime: '11:00 AM', endTime: '12:30 PM' },
                { day: 'Friday', startTime: '02:00 PM', endTime: '04:00 PM' }
            ],
            joinCode: 'XY789Z'
        });
        await newClass.save();
        console.log("Class and Timetable seeded.");

        // 5. Create Attendance for the students
        for (const student of students) {
            const attendance = new Attendance({
                classId: newClass._id,
                studentId: student._id,
                date: new Date(),
                joinTime: new Date(new Date().setHours(9, 0, 0, 0)),
                leaveTime: new Date(new Date().setHours(10, 30, 0, 0)),
                cameraOn: true,
                status: 'present',
                attentionScore: Math.floor(Math.random() * (98 - 70 + 1)) + 70, // 70 to 98
                proctoringFlags: []
            });
            await attendance.save();
        }
        console.log("Attendance seeded.");

        // 6. Create Assignments
        const assignment1 = new Assignment({
            classId: newClass._id,
            title: 'Neural Networks Basics',
            topic: 'Backpropagation',
            description: 'Implement a basic feedforward neural network in Python from scratch.',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
            submissions: []
        });

        // Add one mock submission
        assignment1.submissions.push({
            studentId: students[0]._id,
            content: 'https://github.com/alice/neural-network',
            submittedAt: new Date(),
            grade: 95,
            feedback: 'Excellent clean code.'
        });
        await assignment1.save();
        console.log("Assignments seeded.");

        // 7. Create Sample Exam
        const exam = new Exam({
            classId: newClass._id,
            title: 'Midterm Evaluation - Neural Networks',
            description: 'Covers perceptrons, backprop, and CNNs.',
            startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            duration: 60,
            isActive: true, // Marked as active for easy testing bounds
            questions: [
                {
                    questionText: 'What activation function is commonly used in hidden layers of a deep neural network?',
                    options: ['Sigmoid', 'ReLU', 'Step Function', 'Linear'],
                    correctOption: 1,
                    points: 5
                },
                {
                    questionText: 'Which algorithm is used to update weights in neural networks?',
                    options: ['Gradient Descent', 'Binary Search', 'A* Search', 'K-Means'],
                    correctOption: 0,
                    points: 5
                }
            ],
            proctoringConfig: { requireCamera: true, blockTabSwitch: true }
        });
        await exam.save();
        console.log("Exams (Proctored) seeded.");

        // 8. Create Sample Quiz Results
        for (let i = 0; i < 3; i++) {
            const quizRes = new QuizResult({
                classId: newClass._id,
                studentId: students[i]._id,
                quizTopic: 'Live Concept Quiz: Perceptrons',
                score: Math.floor(Math.random() * 5) + 5, // 5 to 9
                totalPoints: 10,
                answeredAt: new Date()
            });
            await quizRes.save();
        }
        console.log("Live Quiz Results seeded.");

        // 9. Gamification (XP & Badges)
        for (const student of students) {
            const xp = Math.floor(Math.random() * 500) + 100;
            const gamification = new Gamification({
                userId: student._id,
                points: xp,
                level: Math.floor(xp / 100) + 1,
                badges: [
                    { name: 'First Blood', description: 'Answered a live quiz correctly.', icon: '🎯' },
                    { name: '100% Attentive', description: 'Maintained great focus throughout class.', icon: '🔥' }
                ],
                streaks: { current: 3, longest: 5, lastActiveDate: new Date() }
            });
            await gamification.save();
        }
        console.log("Gamification/Leaderboard stats seeded.");

        // 10. Discussion Forum
        const discussion = new Discussion({
            classId: newClass._id,
            authorId: students[1]._id,
            title: 'Doubt regarding Gradient Vanishing problem',
            content: 'Can someone explain how ReLU solves the vanishing gradient?',
            replies: [
                {
                    authorId: teacherUser._id,
                    content: 'ReLU works because its derivative is exactly 1 for all positive inputs, so the gradient does not shrink when multiplied during backprop!',
                    createdAt: new Date()
                }
            ],
            upvotes: [students[0]._id, students[2]._id],
            isPinned: true
        });
        await discussion.save();
        console.log("Discussions seeded.");

        console.log("-----------------------------------------");
        console.log("🎉 MASTER SEEDING COMPLETE!");
        console.log("Login Credentials to Test:");
        console.log(`Teacher: ${teacherUser.email} / password123`);
        console.log(`Student: ${students[0].email} / password123`);
        console.log("-----------------------------------------");
        
        process.exit(0);
    } catch (error) {
        console.error("Master Seed Failed:", error);
        process.exit(1);
    }
}

seedMaster();
