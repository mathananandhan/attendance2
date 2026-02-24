import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, User, BookOpen, Brain, TrendingUp } from 'lucide-react';
import axios from 'axios';

const ReportCard = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                const headers = { Authorization: `Bearer ${userInfo.token}` };
                const { data } = await axios.get(`https://edutech-x60p.onrender.com/api/reports/student/${userInfo._id}`, { headers });
                setReport(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching report:', error);
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading report...</div>;
    if (!report) return <div className="p-8 text-center text-gray-500">No report data available.</div>;

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800">My Report Card</h2>
            </div>

            {/* Student Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User size={24} className="text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-gray-800">{report.student.name}</h3>
                        <p className="text-gray-500">{report.student.department} • Year {report.student.year}</p>
                        <p className="text-sm text-gray-400">{report.student.email}</p>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen size={20} className="text-green-500" />
                        <span className="text-sm text-gray-500">Attendance Rate</span>
                    </div>
                    <p className={`text-3xl font-bold ${report.summary.attendanceRate >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                        {report.summary.attendanceRate}%
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{report.summary.presentClasses}/{report.summary.totalClasses} classes</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <Brain size={20} className="text-indigo-500" />
                        <span className="text-sm text-gray-500">Avg Attention</span>
                    </div>
                    <p className={`text-3xl font-bold ${report.summary.avgAttention >= 70 ? 'text-indigo-600' : 'text-orange-600'}`}>
                        {report.summary.avgAttention}%
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp size={20} className="text-purple-500" />
                        <span className="text-sm text-gray-500">Avg Grade</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">
                        {report.summary.avgGrade !== null ? `${report.summary.avgGrade}%` : 'N/A'}
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen size={20} className="text-blue-500" />
                        <span className="text-sm text-gray-500">Total Classes</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{report.summary.totalClasses}</p>
                </div>
            </div>

            {/* Attention Trend Chart */}
            {report.trend?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="font-bold text-lg text-gray-700 mb-4">Attention Trend (Last 30 Days)</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={report.trend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Line type="monotone" dataKey="attention" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Classes Enrolled */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-700">Enrolled Classes</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {report.classes?.map(cls => (
                        <div key={cls._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <span className="font-medium text-gray-800">{cls.title}</span>
                        </div>
                    ))}
                    {(!report.classes || report.classes.length === 0) && (
                        <div className="px-6 py-8 text-center text-gray-400">No classes found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportCard;
