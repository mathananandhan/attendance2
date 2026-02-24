async function testLogin() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'teacher@demo.com',
                password: 'password123'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const data = await response.json();
        console.log('Login Successful!');
        console.log('Token:', data.token ? 'Received' : 'Missing');
        console.log('User:', data.name);
    } catch (error) {
        console.error('Login Failed:', error.message);
    }
}

testLogin();
