import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('https://edutech-x60p.onrender.com/api/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleDemoLogin = async (demoEmail, demoPassword) => {
        try {
            const { data } = await axios.post('https://edutech-x60p.onrender.com/api/auth/login', { email: demoEmail, password: demoPassword });
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Demo Login failed. Make sure DB is seeded.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Welcome Back</h2>
                <p className="text-center text-gray-500 mb-8">Sign in to your EduPrime account</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30"
                    >
                        Sign In
                    </button>

                    {/* Demo Logins */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => handleDemoLogin('student@demo.com', 'password123')}
                            className="flex-1 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-semibold rounded-lg transition-colors text-sm"
                        >
                            🎓 Demo Student
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDemoLogin('teacher@demo.com', 'password123')}
                            className="flex-1 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold rounded-lg transition-colors text-sm"
                        >
                            👨‍🏫 Demo Teacher
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-center text-gray-600">
                    Don't have an account?
                    <Link to="/register" className="text-indigo-600 font-bold ml-1 hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
