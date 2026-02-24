import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Flame, Star, Award } from 'lucide-react';
import axios from 'axios';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [myProfile, setMyProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                const headers = { Authorization: `Bearer ${userInfo.token}` };
                const [lbRes, meRes] = await Promise.all([
                    axios.get('https://server-mathananandhan58-4944s-projects.vercel.app/api/gamification/leaderboard', { headers }),
                    axios.get('https://server-mathananandhan58-4944s-projects.vercel.app/api/gamification/me', { headers })
                ]);
                setLeaderboard(lbRes.data);
                setMyProfile(meRes.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching gamification data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getRankIcon = (index) => {
        if (index === 0) return <Trophy size={20} className="text-yellow-500" />;
        if (index === 1) return <Medal size={20} className="text-gray-400" />;
        if (index === 2) return <Medal size={20} className="text-amber-600" />;
        return <span className="text-sm font-bold text-gray-400 w-5 text-center">#{index + 1}</span>;
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading leaderboard...</div>;

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Leaderboard & Achievements</h2>

            {/* My Stats Card */}
            {myProfile && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <h3 className="font-bold text-lg text-gray-700 mb-4">Your Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-indigo-50 rounded-xl p-4 text-center">
                            <Star size={24} className="mx-auto text-indigo-600 mb-2" />
                            <p className="text-2xl font-bold text-indigo-700">{myProfile.points}</p>
                            <p className="text-xs text-indigo-500">Total Points</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                            <Award size={24} className="mx-auto text-purple-600 mb-2" />
                            <p className="text-2xl font-bold text-purple-700">Lv. {myProfile.level}</p>
                            <p className="text-xs text-purple-500">Current Level</p>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-4 text-center">
                            <Flame size={24} className="mx-auto text-orange-600 mb-2" />
                            <p className="text-2xl font-bold text-orange-700">{myProfile.streaks?.current || 0}</p>
                            <p className="text-xs text-orange-500">Day Streak</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <Trophy size={24} className="mx-auto text-green-600 mb-2" />
                            <p className="text-2xl font-bold text-green-700">{myProfile.badges?.length || 0}</p>
                            <p className="text-xs text-green-500">Badges Earned</p>
                        </div>
                    </div>

                    {/* Badges */}
                    {myProfile.badges?.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-medium text-gray-600 mb-3">Your Badges</h4>
                            <div className="flex flex-wrap gap-3">
                                {myProfile.badges.map((badge, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
                                        <span className="text-lg">{badge.icon}</span>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">{badge.name}</p>
                                            <p className="text-xs text-gray-500">{badge.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Leaderboard Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-700">Top Students</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Rank</th>
                            <th className="px-6 py-4 font-medium">Student</th>
                            <th className="px-6 py-4 font-medium">Department</th>
                            <th className="px-6 py-4 font-medium">Points</th>
                            <th className="px-6 py-4 font-medium">Level</th>
                            <th className="px-6 py-4 font-medium">Badges</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {leaderboard.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                                    No students on the leaderboard yet. Start earning points!
                                </td>
                            </tr>
                        ) : (
                            leaderboard.map((entry, index) => (
                                <tr
                                    key={entry._id}
                                    className={`hover:bg-gray-50 transition-colors ${entry.userId?._id === userInfo._id ? 'bg-indigo-50/30' : ''}`}
                                >
                                    <td className="px-6 py-4">{getRankIcon(index)}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{entry.userId?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-gray-600">{entry.userId?.department || '-'}</td>
                                    <td className="px-6 py-4 font-bold text-indigo-600">{entry.points}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                                            Lv. {entry.level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            {entry.badges?.slice(0, 3).map((b, i) => (
                                                <span key={i} title={b.name}>{b.icon}</span>
                                            ))}
                                            {entry.badges?.length > 3 && (
                                                <span className="text-xs text-gray-400">+{entry.badges.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
