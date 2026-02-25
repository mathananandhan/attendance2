const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../.env' });

const students = [
    { roll: '421123107001', name: 'ABDHUL AZEEZ K', gender: 'Male', email: 'azeshkadar@gmail.com', dob: '04/07/2006' },
    { roll: '421123107002', name: 'AKKSHYAK KUMAR R', gender: 'Male', email: 'akkshyakumar@gmail.com', dob: '03/10/2005' },
    { roll: '421123107003', name: 'ANANDARAMAN G', gender: 'Male', email: 'anandarama675@gmail.com', dob: '13/12/2005' },
    { roll: '421123107004', name: 'ANANDHI S', gender: 'Female', email: 'adhiraadhirai42@gmail.com', dob: '08/24/2006' },
    { roll: '421123107005', name: 'ATCHAYA K', gender: 'Female', email: 'atchaya9625@gmail.com', dob: '06/09/2005' },
    { roll: '421123107006', name: 'ATSHAYA M', gender: 'Female', email: 'atshaya200605@gmail.com', dob: '05/20/2006' },
    { roll: '421123107007', name: 'AZARUDEEN J', gender: 'Male', email: 'azarudeenj53@gmail.com', dob: '07/10/2006' },
    { roll: '421123107008', name: 'CHARIKA V', gender: 'Female', email: 'charikavijayakumar@gmail.com', dob: '05/02/2006' },
    { roll: '421123107009', name: 'DARSHAN M', gender: 'Male', email: 'darshan14102005@gmail.com', dob: '10/14/2005' },
    { roll: '421123107010', name: 'DEEPANRAJ B', gender: 'Male', email: 'deepann0628@gmail.com', dob: '10/06/2005' },
    { roll: '421123107011', name: 'DEVI R', gender: 'Female', email: 'deviravi993@gmail.com', dob: '10/07/2005' },
    { roll: '421123107012', name: 'DEVIKA S', gender: 'Female', email: 'devika26072006@gmail.com', dob: '07/26/2006' },
    { roll: '421123107013', name: 'GOWTHAM G', gender: 'Male', email: 'gowthamgovindrajan@gmail.com', dob: '08/06/2005' },
    { roll: '421123107014', name: 'HARI SARAVANAN M', gender: 'Male', email: 'mharisaravanan@gmail.com', dob: '02/11/2006' },
    { roll: '421123107015', name: 'HARINI R', gender: 'Female', email: 'harinirubasree@gmail.com', dob: '12/17/2005' },
    { roll: '421123107016', name: 'JESSICKA V', gender: 'Female', email: 'vjessicka2005@gmail.com', dob: '12/31/2005' },
    { roll: '421123107017', name: 'JUDEANTONY NIXON D', gender: 'Male', email: 'nixon450066@gmail.com', dob: '06/04/2006' },
    { roll: '421123107018', name: 'KAMALRAAM KB', gender: 'Male', email: 'kamaleshramb2004@gmail.com', dob: '25/12/2004' },
    { roll: '421123107019', name: 'KARTHICKRAJA M', gender: 'Male', email: 'karthickraja.92005@gmail.com', dob: '22/09/2005' },
    { roll: '421123107020', name: 'KARUNYA BI', gender: 'Female', email: 'karuu1605@gmail.com', dob: '09/16/2005' },
    { roll: '421123107021', name: 'KAVIYARASAN S', gender: 'Male', email: 'kaviyarasanselvadurai2005@gmail.com', dob: '03/10/2005' },

    { roll: '421123107022', name: 'KOWSHIKRAJ A', gender: 'Male', email: 'kaushikprasad2005@gmail.com', dob: '26/09/2005' },
    { roll: '421123107023', name: 'KUBER RAJ A', gender: 'Male', email: 'kuberarumugam28@gmail.com', dob: '09/28/2005' },
    { roll: '421123107024', name: 'LEKHA J', gender: 'Female', email: 'lekha25082005@gmail.com', dob: '08/25/2005' },
    { roll: '421123107025', name: 'LOGAPRIYA M', gender: 'Female', email: 'logapriya2@gmail.com', dob: '11/15/2005' },
    { roll: '421123107026', name: 'MUKESH M', gender: 'Male', email: 'mukeshm42087@gmail.com', dob: '05/07/2006' },
    { roll: '421123107027', name: 'MATHAN A', gender: 'Male', email: 'mathananandhan58@gmail.com', dob: '07/09/2006' },
    { roll: '421123107028', name: 'MATHIMALAR S', gender: 'Female', email: 'mathimalar@gmail.com', dob: '10/10/2006' },
    { roll: '421123107029', name: 'MUJIMIL S', gender: 'Male', email: 'mohdmuzzamil1727@gmail.com', dob: '05/02/2005' },
    { roll: '421123107030', name: 'MUKESH BALAMURUGA B', gender: 'Male', email: '11j20mukeshbalamurugan@gmail.com', dob: '20/04/2005' },
    { roll: '421123107031', name: 'NALLASIVAN S', gender: 'Male', email: 'somunallasivan@gmail.com', dob: '11/03/2005' },
    { roll: '421123107032', name: 'NANDHAKUMARII D', gender: 'Male', email: 'dangernandhaa@gmail.com', dob: '06/10/2006' },
    { roll: '421123107033', name: 'NAZEER AHAMED S', gender: 'Male', email: 'nazeerahamed2005@gmail.com', dob: '12/16/2005' },
    { roll: '421123107034', name: 'PONRAJ C', gender: 'Male', email: 'chandruponraj06@gmail.com', dob: '11/05/2006' },
    { roll: '421123107035', name: 'PRADEEVRAJ M', gender: 'Male', email: 'pradeevrajofficial@gmail.com', dob: '01/02/2006' },
    { roll: '421123107036', name: 'PRASANTH S', gender: 'Male', email: 'sprasanth30july@gmail.com', dob: '30/07/2006' },
    { roll: '421123107037', name: 'PRAVEEN M', gender: 'Male', email: 'm.praveen19092005@gmail.com', dob: '09/19/2005' },

    { roll: '421123107038', name: 'PRIYA SHRI A', gender: 'Female', email: 'priyashri.anadhan.pa@gmail.com', dob: '11/26/2005' },
    { roll: '421123107039', name: 'PUGAZHARASAN T', gender: 'Male', email: 'pugazht108@gmail.com', dob: '25/12/2005' },
    { roll: '421123107040', name: 'PUNITHAVALLI M', gender: 'Female', email: 'punithavalli480@gmail.com', dob: '05/07/2006' },
    { roll: '421123107041', name: 'RANGETHA M', gender: 'Female', email: 'rangethamurugan2000@gmail.com', dob: '18/12/2004' },
    { roll: '421123107042', name: 'RAVIKUMAR M', gender: 'Male', email: 'ravikumar787177@gmail.com', dob: '12/25/2005' },
    { roll: '421123107043', name: 'RAVIVARMA S', gender: 'Male', email: 'ravivarmav685041@gmail.com', dob: '11/27/2005' },
    { roll: '421123107044', name: 'ROSHNI I', gender: 'Female', email: 'roshiniiyappan06@gmail.com', dob: '01/08/2006' },
    { roll: '421123107045', name: 'SARAN G', gender: 'Male', email: 'saran8189998439@gmail.com', dob: '03/03/2006' },
    { roll: '421123107046', name: 'SHAJINA SULTHANA K', gender: 'Female', email: 'sshajinkareem@gmail.com', dob: '06/08/2004' },
    { roll: '421123107047', name: 'SIVADHARSHINI J', gender: 'Female', email: 'sivadharshini266@gmail.com', dob: '17/08/2005' },
    { roll: '421123107048', name: 'SRIRAJ S', gender: 'Male', email: 'srirajselvaraj1504@gmail.com', dob: '15/04/2005' },
    { roll: '421123107049', name: 'STANLEY JEBAKUMAR D', gender: 'Male', email: 'xmajor.stanley@gmail.com', dob: '02/04/2006' },
    { roll: '421123107050', name: 'SWATHI S', gender: 'Female', email: 'swathisurendhar30@gmail.com', dob: '03/14/2005' },
    { roll: '421123107051', name: 'THENDRALKUMAR S', gender: 'Male', email: 'thendralkumar726@gmail.com', dob: '16/07/2006' },
    { roll: '421123107052', name: 'VASANTHAN R', gender: 'Male', email: 'vasanthanram6@gmail.com', dob: '12/14/2005' },
    { roll: '421123107053', name: 'VICTOR CHINNAPPAN S', gender: 'Male', email: 'victorjks725@gmail.com', dob: '10/05/2006' },
    { roll: '421123107054', name: 'VICTTOR G', gender: 'Male', email: 'victtor23920@gmail.com', dob: '23/09/2005' },
    { roll: '421123107055', name: 'VIDHYASAAGAR S', gender: 'Male', email: 'vidhyasaagar217@gmail.com', dob: '21/07/2006' },
    { roll: '421123107056', name: 'VISHNUDEV S', gender: 'Male', email: 'vishnu984335@gmail.com', dob: '27/08/2005' },
    { roll: '421123107057', name: 'VIVEKANANDHAN S', gender: 'Male', email: 'vivekanandhanvivek7@gmail.com', dob: '04/02/2006' }
];

async function seedData() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error("MONGO_URI not found in environment. Ensure .env file is correct.");

        await mongoose.connect(uri);
        console.log("Connected to MongoDB...");

        console.log("Wiping dummy users...");
        const result = await User.deleteMany({ role: 'student' });
        console.log("Deleted " + result.deletedCount + " dummy student users.");

        for (const student of students) {
            // Get first name to form the password prefix
            const names = student.name.split(' ');
            const firstName = names[0];

            // Extract year from DOB
            // Expected length in array will have 4 char year somewhere
            const parts = student.dob.replace(/-/g, '/').split('/');
            const year = parts.find(p => p.length === 4) || '2005';

            // Generate password prefix: first four chars of first name
            const prefixRaw = (firstName.replace(/\s/g, "") + "XXXX").substring(0, 4);
            const rawPassword = prefixRaw + year;
            // Capitalize first letter, lowercase rest (e.g. Math2006)
            const finalPassword = rawPassword.charAt(0).toUpperCase() + rawPassword.slice(1).toLowerCase();

            const newUser = new User({
                name: student.name,
                email: student.email,
                password: finalPassword, // User model pre-save hook will hash this
                role: 'student',
                rollNumber: student.roll,
                department: 'AIML',
                year: 3 // Third year
            });
            await newUser.save();
            console.log("Registered: " + student.name + " | Password: " + finalPassword);
        }

        console.log("All 57 real 3rd Year AIML students have been added successfully!");
        mongoose.connection.close();
        process.exit(0);

    } catch (err) {
        console.error("Error during seeding:", err);
        process.exit(1);
    }
}

seedData();
