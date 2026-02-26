const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const User = require('../models/User');

async function createAccounts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for Account Creation...");

        const adminPass = await bcrypt.hash('Admin@123', 10);
        const adminEmail = 'admin@eduprime.edu';

        let adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            adminUser = new User({
                name: 'EduPrime System Admin',
                email: adminEmail,
                password: 'Admin@123', // Mongoose middleware will hash this
                role: 'admin',
                department: 'Administration'
            });
            await adminUser.save();
            console.log(`Admin account created: ${adminEmail} / Admin@123`);
        } else {
            console.log(`Admin account already exists: ${adminEmail}`);
        }

        const teacherEmail = 'test.teacher@eduprime.edu';
        let teacherUser = await User.findOne({ email: teacherEmail });
        if (!teacherUser) {
            teacherUser = new User({
                name: 'Test Teacher',
                email: teacherEmail,
                password: 'Teacher@123',
                role: 'teacher',
                department: 'CSE'
            });
            await teacherUser.save();
            console.log(`Teacher account created: ${teacherEmail} / Teacher@123`);
        } else {
            console.log(`Teacher account already exists: ${teacherEmail}`);
        }

        process.exit(0);

    } catch (err) {
        console.error("Error creating accounts:", err);
        process.exit(1);
    }
}

createAccounts();
