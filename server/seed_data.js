const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Class = require('./models/Class');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        // Clear existing data
        await User.deleteMany({});
        await Class.deleteMany({});
        console.log('Data Cleared');

        // Create Teacher
        const teacher = await User.create({
            name: 'Dr. Alan Grant',
            email: 'teacher@demo.com',
            password: 'password123',
            role: 'teacher',
            department: 'CSE'
        });
        console.log('Teacher Created: teacher@demo.com / password123');

        // Create Student
        const student = await User.create({
            name: 'Tim Murphy',
            email: 'student@demo.com',
            password: 'password123',
            role: 'student',
            department: 'CSE',
            year: 'III',
            parentEmail: 'parent@demo.com'
        });
        console.log('Student Created: student@demo.com / password123');

        // Create Class
        const demoClass = await Class.create({
            title: 'Paleontology 101',
            department: 'CSE',
            year: 'III',
            description: 'Introduction to Raptors and Chaos Theory',
            teacher: teacher._id,
            students: [student._id],
            schedule: [
                { day: 'Monday', startTime: '10:00 AM', endTime: '11:00 AM' },
                { day: 'Wednesday', startTime: '02:00 PM', endTime: '03:00 PM' }
            ]
        });
        console.log('Class Created: Paleontology 101');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
