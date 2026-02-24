import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import axios from 'axios';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
];

const Timetable = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const { data } = await axios.get('https://edutech-x60p.onrender.com/api/classes/my', {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setClasses(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching classes:', error);
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    // Build schedule grid
    const getClassForSlot = (day, timeSlot) => {
        for (const cls of classes) {
            if (!cls.schedule) continue;
            for (const sched of cls.schedule) {
                if (sched.day === day && sched.startTime === timeSlot) {
                    return cls;
                }
            }
        }
        return null;
    };

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    if (loading) return <div className="p-8 text-center text-gray-500">Loading timetable...</div>;

    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
                <Calendar size={28} className="text-indigo-600" />
                <h2 className="text-3xl font-bold text-gray-800">Weekly Timetable</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-24">
                                    <Clock size={16} className="inline mr-1" />
                                    Time
                                </th>
                                {DAYS.map(day => (
                                    <th
                                        key={day}
                                        className={`px-4 py-3 text-center text-sm font-medium ${day === today ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500'}`}
                                    >
                                        {day}
                                        {day === today && (
                                            <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">Today</span>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {TIME_SLOTS.map(time => (
                                <tr key={time} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 text-sm text-gray-500 font-medium">{time}</td>
                                    {DAYS.map(day => {
                                        const cls = getClassForSlot(day, time);
                                        return (
                                            <td key={day} className={`px-2 py-2 ${day === today ? 'bg-indigo-50/30' : ''}`}>
                                                {cls ? (
                                                    <div className="bg-indigo-100 rounded-lg p-2 text-center border border-indigo-200">
                                                        <p className="text-sm font-semibold text-indigo-700 truncate">{cls.title}</p>
                                                        <p className="text-xs text-indigo-500">{cls.department}</p>
                                                    </div>
                                                ) : null}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Class List */}
            <div className="mt-8">
                <h3 className="font-bold text-lg text-gray-700 mb-4">My Classes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map(cls => (
                        <div key={cls._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <h4 className="font-bold text-gray-800">{cls.title}</h4>
                            <p className="text-sm text-gray-500 mb-2">{cls.department} • Year {cls.year}</p>
                            {cls.schedule?.length > 0 && (
                                <div className="space-y-1">
                                    {cls.schedule.map((s, i) => (
                                        <p key={i} className="text-xs text-gray-400">
                                            {s.day}: {s.startTime} - {s.endTime}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {classes.length === 0 && (
                        <p className="text-gray-400 col-span-3 text-center py-8">No classes found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Timetable;
