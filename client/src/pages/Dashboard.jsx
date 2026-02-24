import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, Calendar, Settings,
    LogOut, User, Video, PlusCircle, Presentation, ShieldCheck,
    MessageSquare, Trophy, FileText, Moon, Sun, ClipboardList
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from '../components/NotificationBell';
import Analytics from './Analytics';
import Classes from './Classes';
import DiscussionForum from './DiscussionForum';
import Leaderboard from './Leaderboard';
import Timetable from './Timetable';
import ResourceLibrary from './ResourceLibrary';
import ReportCard from './ReportCard';
import ParentPortal from './ParentPortal';
import ExamsManager from './ExamsManager';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { darkMode, toggleDarkMode } = useTheme();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            navigate('/login');
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUser(JSON.parse(userInfo));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    if (!user) return null;

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/dashboard' },
        { icon: <BookOpen size={20} />, label: 'My Classes', path: '/dashboard/classes' },
        { icon: <Calendar size={20} />, label: 'Timetable', path: '/dashboard/timetable' },
        { icon: <Presentation size={20} />, label: 'Analytics', path: '/dashboard/analytics' },
        { icon: <ShieldCheck size={20} />, label: 'Exams', path: '/dashboard/exams' },
        { icon: <MessageSquare size={20} />, label: 'Discussions', path: '/dashboard/discussions' },
        { icon: <Trophy size={20} />, label: 'Leaderboard', path: '/dashboard/leaderboard' },
        { icon: <FileText size={20} />, label: 'Resources', path: '/dashboard/resources' },
        { icon: <ClipboardList size={20} />, label: 'Report Card', path: '/dashboard/report' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/dashboard/settings' },
    ];

    return (
        <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Sidebar */}
            <aside className={`w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r hidden md:flex flex-col`}>
                <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
                        <Video className="w-6 h-6" />
                        <span>EduPrime</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
                                ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm'
                                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}

                    {user.role === 'admin' && (
                        <Link
                            to="/admin-dashboard"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === '/admin-dashboard'
                                ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm'
                                : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`
                                }`}
                        >
                            <Settings size={20} />
                            Admin Panel
                        </Link>
                    )}
                </nav>

                <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className={`text-sm font-semibold truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{user.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10`}>
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Dashboard</h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleDarkMode}
                            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                            title={darkMode ? 'Light Mode' : 'Dark Mode'}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <NotificationBell />
                        {user.role === 'teacher' && (
                            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-lg shadow-indigo-500/20">
                                <PlusCircle size={18} />
                                Create Class
                            </button>
                        )}
                    </div>
                </header>

                <div className="p-8">
                    <Routes>
                        <Route path="/" element={<Overview user={user} darkMode={darkMode} />} />
                        <Route path="/classes" element={<Classes user={user} />} />
                        <Route path="/timetable" element={<Timetable />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/analytics/:classId" element={<Analytics />} />
                        <Route path="/discussions" element={<DiscussionForum />} />
                        <Route path="/discussions/:classId" element={<DiscussionForum />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/resources" element={<ResourceLibrary />} />
                        <Route path="/resources/:classId" element={<ResourceLibrary />} />
                        <Route path="/report" element={<ReportCard />} />
                        <Route path="/parent-portal" element={<ParentPortal />} />
                        <Route path="/parent-portal/:studentId" element={<ParentPortal />} />
                        <Route path="/exams" element={<ExamsManager user={user} darkMode={darkMode} />} />
                        <Route path="/settings" element={
                            <div className="p-6">
                                <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Settings</h2>
                                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-6 rounded-xl shadow-sm border`}>
                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Dark Mode</p>
                                            <p className="text-sm text-gray-500">Toggle dark/light theme</p>
                                        </div>
                                        <button
                                            onClick={toggleDarkMode}
                                            className={`w-12 h-6 rounded-full transition-all relative ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow ${darkMode ? 'left-6' : 'left-0.5'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        } />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

const Overview = ({ user, darkMode }) => {
    // Determine the user's role and display context-specific stats
    const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

    return (
        <div className="space-y-6">
            {/* Camu Style 4-Column Grid Header Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isTeacher ? (
                    <>
                        <CamuCard title="Total Classes" value="4" bg="bg-emerald-500" icon="🎓" />
                        <CamuCard title="Present Students" value="142" bg="bg-green-600" icon="✅" />
                        <CamuCard title="Absent Students" value="12" bg="bg-red-500" icon="❌" />
                        <CamuCard title="Pending Assignments" value="8" bg="bg-orange-500" icon="📝" />
                    </>
                ) : (
                    <>
                        <CamuCard title="Attendance" value="92%" bg="bg-green-600" icon="📊" />
                        <CamuCard title="Classes Missed" value="2" bg="bg-red-500" icon="⚠️" />
                        <CamuCard title="Upcoming Exams" value="1" bg="bg-blue-600" icon="⏱️" />
                        <CamuCard title="Assignments Due" value="3" bg="bg-orange-500" icon="📅" />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-6 rounded-2xl shadow-sm border`}>
                    <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={`flex items-center gap-4 p-4 ${darkMode ? 'hover:bg-gray-700 bg-gray-750' : 'hover:bg-gray-50 bg-gray-50/50'} rounded-xl transition-colors border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className={`w-3 h-3 rounded-full ${i === 1 ? 'bg-green-500' : i === 2 ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                                <div>
                                    <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{i === 1 ? 'Attendance Marked for CS-101' : 'New Assignment Uploaded'}</p>
                                    <p className="text-xs text-gray-500">{i * 2} hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vertical Sidebar Links (Camu-like quick actions) */}
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-6 rounded-2xl shadow-sm border flex flex-col gap-3`}>
                    <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Quick Links</h3>

                    <Link to="/dashboard/leaderboard" className={`flex items-center gap-3 p-4 rounded-xl transition-all font-medium shadow-sm border ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200' : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md text-gray-700'}`}>
                        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><Trophy size={20} /></div>
                        Leaderboard
                    </Link>

                    <Link to="/dashboard/discussions" className={`flex items-center gap-3 p-4 rounded-xl transition-all font-medium shadow-sm border ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200' : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md text-gray-700'}`}>
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><MessageSquare size={20} /></div>
                        Discussions
                    </Link>

                    <Link to="/dashboard/report" className={`flex items-center gap-3 p-4 rounded-xl transition-all font-medium shadow-sm border ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200' : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md text-gray-700'}`}>
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><ClipboardList size={20} /></div>
                        Report Card
                    </Link>

                    {isTeacher && (
                        <button className="mt-auto w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all">
                            <PlusCircle size={18} /> Add New Activity
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// New Camu-style Card component
const CamuCard = ({ title, value, bg, icon }) => (
    <div className={`${bg} text-white p-6 rounded-2xl shadow-md relative overflow-hidden transition-transform hover:-translate-y-1`}>
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
                <p className="font-semibold text-white/90 text-sm">{title}</p>
                <span className="text-2xl bg-white/20 p-2 rounded-xl backdrop-blur-sm shadow-inner">{icon}</span>
            </div>
            <h3 className="text-4xl font-extrabold tracking-tight drop-shadow-sm">{value}</h3>
        </div>
        {/* Decorative background shapes */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-white/10 pointer-events-none"></div>
    </div>
);

export default Dashboard;
