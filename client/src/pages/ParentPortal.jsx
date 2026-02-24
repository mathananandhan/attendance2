import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { User, BookOpen, Brain, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const ParentPortal = () => {
    const { studentId } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchReport = React.useCallback(async (id) => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const { data } = await axios.get(`https://server-mathananandhan58-4944s-projects.vercel.app/api/reports/student/${id}`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setReport(data);
            setError('');
            setLoading(false);
        } catch (err) {
            console.error('Error fetching report:', err);
            setError('Unable to load student report.');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (studentId) fetchReport(studentId);
        else {
            // If accessed as parent, use own child's ID from userInfo
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            if (userInfo._id) fetchReport(userInfo._id);
            else setLoading(false);
        }
    }, [studentId, fetchReport]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading student report...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!report) return <div className="p-8 text-center text-gray-500">No report available.</div>;

    const { student, summary, trend } = report;

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Parent Portal</h2>
            <p className="text-gray-500 mb-8">View your child's academic performance and attendance</p>

            {/* Student Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User size={24} className="text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-gray-800">{student.name}</h3>
                        <p className="text-gray-500">{student.department} • Year {student.year}</p>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen size={20} className="text-green-500" />
                        <span className="text-sm text-gray-500">Attendance</span>
                    </div>
                    <p className={`text-3xl font-bold ${summary.attendanceRate >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                        {summary.attendanceRate}%
                    </p>
                    {summary.attendanceRate < 75 && (
                        <div className="flex items-center gap-1 mt-2 text-red-500 text-xs">
                            <AlertTriangle size={12} />
                            <span>Below minimum requirement</span>
                        </div>
                    )}
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <Brain size={20} className="text-indigo-500" />
                        <span className="text-sm text-gray-500">Avg. Attention</span>
                    </div>
                    <p className={`text-3xl font-bold ${summary.avgAttention >= 70 ? 'text-indigo-600' : 'text-orange-600'}`}>
                        {summary.avgAttention}%
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen size={20} className="text-purple-500" />
                        <span className="text-sm text-gray-500">Avg. Grade</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">
                        {summary.avgGrade !== null ? `${summary.avgGrade}%` : 'N/A'}
                    </p>
                </div>
            </div>

            {/* Attention Trend */}
            {trend?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-lg text-gray-700 mb-4">30-Day Performance Trend</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend}>
                                <defs>
                                    <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Area type="monotone" dataKey="attention" stroke="#4F46E5" fillOpacity={1} fill="url(#colorAtt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentPortal;
