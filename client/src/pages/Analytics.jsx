import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { AlertTriangle, Brain, Lightbulb, Loader2 } from 'lucide-react';
import axios from 'axios';

const Analytics = () => {
    const { classId } = useParams();
    const [trendData, setTrendData] = useState([]);
    const [studentData, setStudentData] = useState([]);
    const [riskPredictions, setRiskPredictions] = useState([]);
    const [loadingRisk, setLoadingRisk] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!classId) return;
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const { data } = await axios.get(`/api/analytics/class/${classId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setTrendData(data.attentionTrend);
                setStudentData(data.studentPerformance);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            }
        };
        fetchData();
    }, [classId]);

    const runRiskPrediction = async () => {
        if (studentData.length === 0) return;
        setLoadingRisk(true);
        try {
            const payload = studentData.map(s => ({
                name: s.name,
                attendanceRate: s.attendance || 0,
                avgAttention: s.score || 0,
                avgGrade: s.grade || null
            }));
            const { data } = await axios.post('https://edtech-ai-service.onrender.com/predict_risk', { students: payload });
            setRiskPredictions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error running risk prediction:', error);
        }
        setLoadingRisk(false);
    };

    const getRiskColor = (level) => {
        const colors = { high: 'text-red-600 bg-red-50 border-red-200', medium: 'text-orange-600 bg-orange-50 border-orange-200', low: 'text-green-600 bg-green-50 border-green-200' };
        return colors[level] || colors.low;
    };

    const getRiskBadge = (level) => {
        const badges = { high: 'bg-red-100 text-red-700', medium: 'bg-orange-100 text-orange-700', low: 'bg-green-100 text-green-700' };
        return badges[level] || badges.low;
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Class Performance Analytics</h2>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Attention Trend Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-4 text-gray-700">Average Attention Trend</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Area type="monotone" dataKey="avgAttention" stroke="#4F46E5" fillOpacity={1} fill="url(#colorAtt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Student Performance Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-4 text-gray-700">Student Engagement Leaderboard</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={studentData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                                <Bar dataKey="score" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* AI Risk Prediction Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Brain size={22} className="text-indigo-600" />
                        <h3 className="font-bold text-lg text-gray-700">AI Risk Prediction</h3>
                    </div>
                    <button
                        onClick={runRiskPrediction}
                        disabled={loadingRisk || studentData.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingRisk ? <Loader2 size={16} className="animate-spin" /> : <Lightbulb size={16} />}
                        {loadingRisk ? 'Analyzing...' : 'Run AI Analysis'}
                    </button>
                </div>

                {riskPredictions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {riskPredictions.map((pred, idx) => (
                            <div key={idx} className={`rounded-xl p-4 border ${getRiskColor(pred.riskLevel)}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-gray-800">{pred.name}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${getRiskBadge(pred.riskLevel)}`}>
                                        {pred.riskLevel}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${pred.riskLevel === 'high' ? 'bg-red-500' : pred.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-green-500'}`}
                                            style={{ width: `${pred.riskScore}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Risk Score: {pred.riskScore}/100</p>
                                </div>
                                {pred.factors?.length > 0 && (
                                    <div className="mb-2">
                                        <p className="text-xs font-medium text-gray-600 mb-1">Factors:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {pred.factors.map((f, i) => (
                                                <span key={i} className="text-xs bg-white/50 px-2 py-0.5 rounded border border-gray-200">{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {pred.recommendations?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 mb-1">Recommended:</p>
                                        <ul className="text-xs text-gray-500 space-y-0.5">
                                            {pred.recommendations.slice(0, 2).map((r, i) => (
                                                <li key={i}>• {r}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                        {studentData.length === 0 ? 'No student data available for this class.' : 'Click "Run AI Analysis" to identify at-risk students using AI.'}
                    </p>
                )}
            </div>

            {/* At Risk Students Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-700">Students At Risk (Low Attention)</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Student Name</th>
                            <th className="px-6 py-4 font-medium">Avg. Attention</th>
                            <th className="px-6 py-4 font-medium">Attendance Rate</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {studentData.filter(s => s.score < 60).map((student, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                                <td className="px-6 py-4 text-red-500 font-bold">{student.score}%</td>
                                <td className="px-6 py-4 text-gray-600">{student.attendance} Classes</td>
                                <td className="px-6 py-4">
                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Needs Help</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Analytics;
