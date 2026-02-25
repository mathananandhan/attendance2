import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Users, Calendar, Plus, X } from 'lucide-react';
import axios from 'axios';

const Classes = ({ user }) => {
    const [classes, setClasses] = React.useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        year: '',
        section: '',
        description: '',
        scheduleDay: 'Monday',
        scheduleStart: '',
        scheduleEnd: ''
    });

    const fetchClasses = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const response = await fetch('https://edutech-x60p.onrender.com/api/classes/my', {
                headers: { 'Authorization': `Bearer ${userInfo.token}` }
            });
            const data = await response.json();
            setClasses(data);
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };

    React.useEffect(() => {
        fetchClasses();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.post('https://edutech-x60p.onrender.com/api/classes', {
                title: formData.title,
                department: formData.department,
                year: formData.year,
                section: formData.section,
                description: formData.description,
                schedule: [{
                    day: formData.scheduleDay,
                    startTime: formData.scheduleStart,
                    endTime: formData.scheduleEnd
                }]
            }, {
                headers: { 'Authorization': `Bearer ${userInfo.token}` }
            });
            setShowModal(false);
            fetchClasses(); // Refresh list
            setFormData({
                title: '',
                department: '',
                year: '',
                section: '',
                description: '',
                scheduleDay: 'Monday',
                scheduleStart: '',
                scheduleEnd: ''
            });
        } catch (error) {
            console.error("Error creating class:", error);
            const message = error.response?.data?.message || error.message || "Failed to create class";
            alert(`Error: ${message}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                    {user.role === 'teacher' ? 'My Teaching Schedule' : 'Enrolled Classes'}
                </h2>
                {user.role === 'teacher' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Create New Class
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => (
                    <div key={cls._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
                        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="font-bold text-xl drop-shadow-md">{cls.title}</h3>
                                <p className="text-sm opacity-90">{cls.teacher?.name || 'Instructor'}</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                                <div className="flex items-center gap-1">
                                    <Users size={16} />
                                    <span>{cls.students?.length || 0} Students</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>{cls.schedule[0]?.day || 'TBA'}</span>
                                </div>
                            </div>

                            {user.role === 'teacher' && cls.joinCode && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center group/code">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Class Code</p>
                                        <p className="font-mono text-lg font-bold text-indigo-600 select-all">{cls.joinCode}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/join/${cls.joinCode}`);
                                            alert('Invite link copied!');
                                        }}
                                        className="text-xs bg-white border border-gray-200 px-2 py-1 rounded shadow-sm hover:bg-gray-50 text-gray-600"
                                    >
                                        Copy Link
                                    </button>
                                </div>
                            )}

                            <div className="space-y-2">
                                {user.role === 'teacher' ? (
                                    <>
                                        <Link
                                            to={`/classroom/${cls._id}`}
                                            className="block w-full text-center px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                        >
                                            Start Live Class
                                        </Link>
                                        <Link
                                            to={`/dashboard/analytics/${cls._id}`}
                                            className="block w-full text-center px-4 py-2 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors border border-indigo-200"
                                        >
                                            View Analytics
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        to={`/classroom/${cls._id}`}
                                        className="block w-full text-center px-4 py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100"
                                    >
                                        Join Class
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {classes.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No classes found.</p>
                </div>
            )}

            {/* Fab for Students to Join Class */}
            {user.role === 'student' && (
                <button
                    onClick={() => setShowJoinModal(true)}
                    className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <Plus size={24} />
                    <span className="font-bold">Join Class</span>
                </button>
            )}

            {/* Join Class Modal (Student) */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative animate-fade-in">
                        <button
                            onClick={() => setShowJoinModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Join a Class</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Enter Class Code</label>
                                <input
                                    type="text"
                                    value={joinCodeInput}
                                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none text-center font-mono text-lg tracking-widest uppercase"
                                    placeholder="XXXXXX"
                                    maxLength={6}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    window.location.href = `/join/${joinCodeInput}`;
                                }}
                                disabled={joinCodeInput.length < 6}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Join Class
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Class Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative animate-fade-in">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Create New Class</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. Advanced AI"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="">Select Dept</option>
                                        <option value="CSE">CSE</option>
                                        <option value="ECE">ECE</option>
                                        <option value="MECH">MECH</option>
                                        <option value="CIVIL">CIVIL</option>
                                        <option value="IT">IT</option>
                                        <option value="AI&DS">AI&DS</option>
                                        <option value="AIML">AIML</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="">Select Year</option>
                                        <option value="I">I</option>
                                        <option value="II">II</option>
                                        <option value="III">III</option>
                                        <option value="IV">IV</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                    <select
                                        name="section"
                                        value={formData.section}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="">Select Section</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Brief description..."
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                                    <select
                                        name="scheduleDay"
                                        value={formData.scheduleDay}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="Monday">Monday</option>
                                        <option value="Tuesday">Tuesday</option>
                                        <option value="Wednesday">Wednesday</option>
                                        <option value="Thursday">Thursday</option>
                                        <option value="Friday">Friday</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        name="scheduleStart"
                                        value={formData.scheduleStart}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        name="scheduleEnd"
                                        value={formData.scheduleEnd}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow">
                                Create Class
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classes;
