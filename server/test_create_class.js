async function testCreateClass() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'teacher@demo.com', password: 'password123' })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${await loginRes.text()}`);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Logged in. Token received.');

        // 2. Create Class
        console.log('Creating class...');
        const createRes = await fetch('http://127.0.0.1:5000/api/classes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: "Machine Learning",
                department: "AI&DS",
                year: "II",
                description: "Types of ML",
                schedule: [{
                    day: "Thursday",
                    startTime: "09:00",
                    endTime: "10:30"
                }]
            })
        });

        if (!createRes.ok) {
            const errorText = await createRes.text();
            throw new Error(`Create Class failed: ${createRes.status} ${errorText}`);
        }

        const classData = await createRes.json();
        console.log('Class created successfully:', classData);

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

testCreateClass();
