const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

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

const checkUser = async () => {
    await connectDB();
    try {
        const teacher = await User.findOne({ email: 'teacher@demo.com' });
        if (teacher) {
            console.log('Teacher found:');
            console.log(`Email: ${teacher.email}`);
            console.log(`Role: ${teacher.role}`);
            console.log(`Department: ${teacher.department}`);
        } else {
            console.log('Teacher NOT found.');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
