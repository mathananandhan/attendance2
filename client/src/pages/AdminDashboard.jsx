import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, BookOpen, UserPlus, Save, Bell, FileText, Download, Send } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [adminStats, setAdminStats] = useState(null);

    // New Teacher Form
    const [newTeacherName, setNewTeacherName] = useState('');
    const [newTeacherEmail, setNewTeacherEmail] = useState('');
    const [newTeacherPassword, setNewTeacherPassword] = useState('');
    const [newTeacherDept, setNewTeacherDept] = useState('CSE');

    // Notification Form
    const [notifTitle, setNotifTitle] = useState('');
    const [notifMessage, setNotifMessage] = useState('');
    const [notifType, setNotifType] = useState('system');

    const [message, setMessage] = useState('');

    const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const fetchData = React.useCallback(async () => {
        try {
            const usersRes = await axios.get('https://edutech-x60p.onrender.com/api/admin/users', config);
            const classesRes = await axios.get('https://edutech-x60p.onrender.com/api/admin/classes', config);
            const statsRes = await axios.get('https://edutech-x60p.onrender.com/api/analytics/admin', config);

            setTeachers(usersRes.data.filter(u => u.role === 'teacher'));
            setClasses(classesRes.data);
            setAdminStats(statsRes.data);
        } catch (error) {
            console.error("Error fetching admin data", error);
        }
    }, [config]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (token) fetchData();
    }, [token, fetchData]);

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://edutech-x60p.onrender.com/api/admin/create-teacher', {
                name: newTeacherName,
                email: newTeacherEmail,
                password: newTeacherPassword,
                department: newTeacherDept
            }, config);
            setMessage('Teacher created successfully!');
            setNewTeacherName('');
            setNewTeacherEmail('');
            setNewTeacherPassword('');
            fetchData(); // Refresh list
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error creating teacher');
        }
    };

    const handleAssignTeacher = async (classId, teacherId) => {
        try {
            await axios.put('https://edutech-x60p.onrender.com/api/admin/assign-teacher', {
                classId,
                teacherId
            }, config);
            setMessage(`Teacher assigned to class successfully!`);
            fetchData();
        } catch {
            setMessage('Error assigning teacher');
        }
    };


    const handleSendNotification = async (e) => {
        e.preventDefault();
        // logic to be implemented on backend for broadcast, for now just a placeholder success
        setMessage('System notification sent to all users');
        setNotifTitle('');
        setNotifMessage('');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-indigo-900 text-white p-6 hidden md:block">
                <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
                <nav className="space-y-4">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${activeTab === 'overview' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}
                    >
                        <FileText size={20} />
                        <span>Overview Analytics</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('teachers')}
                        className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${activeTab === 'teachers' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}
                    >
                        <UserPlus size={20} />
                        <span>Manage Teachers</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('classes')}
                        className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${activeTab === 'classes' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}
                    >
                        <BookOpen size={20} />
                        <span>Assign Classes</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${activeTab === 'notifications' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}
                    >
                        <Bell size={20} />
                        <span>Notifications</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${activeTab === 'reports' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}
                    >
                        <FileText size={20} />
                        <span>System Reports</span>
                    </button>
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                {message && (
                    <div className="bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700 p-4 mb-6 rounded shadow-sm flex justify-between items-center">
                        <span>{message}</span>
                        <button onClick={() => setMessage('')} className="text-indigo-900 font-bold">&times;</button>
                    </div>
                )}

                {activeTab === 'overview' && adminStats && (
                    <div className="max-w-6xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FileText className="text-indigo-600" /> System Overview
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Students</h3>
                                <p className="text-3xl font-black text-indigo-600">{adminStats.totalStudents}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Teachers</h3>
                                <p className="text-3xl font-black text-emerald-500">{adminStats.totalTeachers}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Active Classes</h3>
                                <p className="text-3xl font-black text-blue-500">{adminStats.totalClasses}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Avg System Attention</h3>
                                <p className="text-3xl font-black text-amber-500">{adminStats.avgAttentionScore}%</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'teachers' && (
                    <div className="max-w-4xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <UserPlus className="text-indigo-600" /> Create New Teacher
                        </h2>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                            <form onSubmit={handleCreateTeacher} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input type="text" required value={newTeacherName} onChange={(e) => setNewTeacherName(e.target.value)} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Dr. Smith" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" required value={newTeacherEmail} onChange={(e) => setNewTeacherEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="teacher@edutech.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select value={newTeacherDept} onChange={(e) => setNewTeacherDept(e.target.value)} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                        <option value="CSE">CSE</option>
                                        <option value="ECE">ECE</option>
                                        <option value="MECH">MECH</option>
                                        <option value="CIVIL">CIVIL</option>
                                        <option value="IT">IT</option>
                                        <option value="AI&DS">AI&DS</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input type="password" required value={newTeacherPassword} onChange={(e) => setNewTeacherPassword(e.target.value)} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="******" />
                                </div>
                                <div className="md:col-span-2">
                                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow">
                                        Create Teacher Account
                                    </button>
                                </div>
                            </form>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-4">Existing Teachers</h3>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Dept</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teachers.length === 0 ? (
                                        <tr><td colSpan="3" className="p-4 text-center text-gray-500">No teachers found</td></tr>
                                    ) : (
                                        teachers.map(teacher => (
                                            <tr key={teacher._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-gray-800">{teacher.name}</td>
                                                <td className="py-3 px-4 text-gray-600">{teacher.email}</td>
                                                <td className="py-3 px-4 text-gray-600"><span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">{teacher.department}</span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'classes' && (
                    <div className="max-w-5xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <BookOpen className="text-indigo-600" /> Class Assignments
                        </h2>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Class Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Current Teacher</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Assign To</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classes.map(cls => (
                                        <tr key={cls._id} className="border-b border-gray-100">
                                            <td className="py-3 px-4">
                                                <p className="font-bold text-gray-800">{cls.title}</p>
                                                <p className="text-xs text-gray-500">{cls.description}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                {cls.teacher ? (
                                                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                                                        <Users size={14} /> {cls.teacher.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-red-500 text-sm">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <select
                                                    id={`select-${cls._id}`}
                                                    className="w-full px-3 py-2 rounded border text-sm"
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Select Teacher</option>
                                                    {teachers.map(t => (
                                                        <option key={t._id} value={t._id}>{t.name} ({t.department})</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => {
                                                        const select = document.getElementById(`select-${cls._id}`);
                                                        if (select.value) handleAssignTeacher(cls._id, select.value);
                                                    }}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1"
                                                >
                                                    <Save size={14} /> Save
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Bell className="text-indigo-600" /> System Notifications
                        </h2>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <form onSubmit={handleSendNotification} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={notifTitle}
                                        onChange={(e) => setNotifTitle(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="System Alert"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea
                                        required
                                        value={notifMessage}
                                        onChange={(e) => setNotifMessage(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                                        placeholder="Maintenance scheduled for..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={notifType}
                                        onChange={(e) => setNotifType(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="system">System Announcement</option>
                                        <option value="alert">Critical Alert</option>
                                        <option value="info">Information</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow flex items-center justify-center gap-2">
                                    <Send size={18} /> Send to All Users
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="max-w-4xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FileText className="text-indigo-600" /> System Reports
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">Attendance Summary</h3>
                                <p className="text-gray-500 text-sm mb-4">Export monthly attendance summary for all departments.</p>
                                <button className="text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-800">
                                    <Download size={16} /> Download CSV
                                </button>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">Performance Analytics</h3>
                                <p className="text-gray-500 text-sm mb-4">Detailed academic performance report by department.</p>
                                <button className="text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-800">
                                    <Download size={16} /> Download PDF
                                </button>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">Teacher Activity Log</h3>
                                <p className="text-gray-500 text-sm mb-4">Log of teacher logins, class creations, and grading.</p>
                                <button className="text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-800">
                                    <Download size={16} /> Download CSV
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
