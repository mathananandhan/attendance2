import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [department, setDepartment] = useState('CSE');
    const [year, setYear] = useState('I');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Role is automatically 'student' for public registration
            const { data } = await axios.post('https://server-mathananandhan58-4944s-projects.vercel.app/api/auth/signup', {
                name, email, password, role: 'student', department, year
            });
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleDemoLogin = async (demoEmail, demoPassword) => {
        try {
            const { data } = await axios.post('https://server-mathananandhan58-4944s-projects.vercel.app/api/auth/login', { email: demoEmail, password: demoPassword });
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Demo Login failed. Make sure DB is seeded.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Create Account</h2>
                <p className="text-center text-gray-500 mb-8">Join thousands of learners today</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Department and Year Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            >
                                <option value="">Select Dept</option>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="MECH">MECH</option>
                                <option value="CIVIL">CIVIL</option>
                                <option value="IT">IT</option>
                                <option value="AI&DS">AI&DS</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            >
                                <option value="">Select Year</option>
                                <option value="I">I</option>
                                <option value="II">II</option>
                                <option value="III">III</option>
                                <option value="IV">IV</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30"
                    >
                        Create Student Account
                    </button>

                    <p className="text-xs text-center text-gray-500 mt-2">
                        Note: Teacher and Admin accounts are created by the administrator.
                    </p>

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
                    Already have an account?
                    <Link to="/login" className="text-indigo-600 font-bold ml-1 hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
