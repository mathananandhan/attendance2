import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PlusCircle, AlertTriangle } from 'lucide-react';

const ExamsManager = ({ user, darkMode }) => {
    const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
    const [exams, setExams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [examTopic, setExamTopic] = useState('');
    const [examCount, setExamCount] = useState(5);
    const [isGenerating, setIsGenerating] = useState(false);

    // For manual creation / after AI generation
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo) return;

                const headers = { 'Authorization': `Bearer ${userInfo.token}` };

                // Fetch classes
                const classRes = await fetch('https://edutech-x60p.onrender.com/api/classes/my', { headers });
                const classData = await classRes.json();
                const fetchedClasses = Array.isArray(classData) ? classData : classData.data || [];
                setClasses(fetchedClasses);

                if (fetchedClasses.length > 0) {
                    const firstClassId = fetchedClasses[0]._id;
                    setSelectedClassId(firstClassId);

                    // Fetch exams for the first class (or we could fetch all exams by looping, 
                    // but let's simple default to the first class for this view)
                    const examRes = await fetch(`https://edutech-x60p.onrender.com/api/exams/class/${firstClassId}`, { headers });
                    const examData = await examRes.json();
                    setExams(examData.data || []);
                }
            } catch (err) {
                console.error("Error fetching exams data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleClassChange = async (e) => {
        const sid = e.target.value;
        setSelectedClassId(sid);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const headers = { 'Authorization': `Bearer ${userInfo.token}` };
            const examRes = await fetch(`https://edutech-x60p.onrender.com/api/exams/class/${sid}`, { headers });
            const examData = await examRes.json();
            setExams(examData.data || []);
        } catch (err) {
            console.error("Error fetching exams:", err);
        }
    };

    const handleAIGenerate = async () => {
        if (!examTopic) {
            alert("Please enter a topic to generate an exam.");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch('https://edtech-ai-service.onrender.com/generate_exam', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: examTopic, questionCount: parseInt(examCount) })
            });
            const data = await response.json();

            if (data.title && data.questions) {
                setTitle(data.title);
                setDescription(`AI Generated Exam on ${examTopic}`);
                setQuestions(data.questions);
            }
        } catch (err) {
            console.error("Error generating exam:", err);
            alert("Failed to generate exam from AI.");
        }
        setIsGenerating(false);
    };

    const handleCreateExam = async () => {
        if (!selectedClassId || !title || questions.length === 0) {
            alert("Please complete the form and generate questions before saving.");
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const payload = {
                classId: selectedClassId,
                title,
                description,
                startTime: new Date(),
                duration: examCount * 6, // roughly 6 mins per question
                questions,
                proctoringConfig: { requireCamera: true, blockTabSwitch: true }
            };

            await fetch('https://edutech-x60p.onrender.com/api/exams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify(payload)
            });

            // Reset and refresh
            setShowCreateForm(false);
            setTitle('');
            setDescription('');
            setQuestions([]);

            // Refresh list
            const examRes = await fetch(`https://edutech-x60p.onrender.com/api/exams/class/${selectedClassId}`, {
                headers: { 'Authorization': `Bearer ${userInfo.token}` }
            });
            const examData = await examRes.json();
            setExams(examData.data || []);

        } catch (err) {
            console.error("Error creating exam:", err);
            alert("Failed to save exam.");
        }
    };

    return (
        <div className={`p-6 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Secure Exam Portal</h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage and take proctored assessments.</p>
                </div>
                {isTeacher && (
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        {showCreateForm ? 'Cancel' : <><PlusCircle size={20} /> Create Exam</>}
                    </button>
                )}
            </div>

            <div className="mb-6 flex items-center gap-4">
                <label className="font-semibold">Select Class: </label>
                <select
                    value={selectedClassId}
                    onChange={handleClassChange}
                    className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                    {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.title} - {c.department}</option>
                    ))}
                    {classes.length === 0 && <option value="">No Classes Found</option>}
                </select>
            </div>

            {/* Teacher Form */}
            {isTeacher && showCreateForm && (
                <div className={`mb-8 p-6 rounded-2xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} animate-fade-in`}>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span role="img" aria-label="sparkles">✨</span> AI Exam Generator
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-400">Topic</label>
                            <input
                                type="text"
                                placeholder="e.g. History of Rome"
                                value={examTopic}
                                onChange={e => setExamTopic(e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'} focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-400">Number of Questions</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="1" max="20"
                                    value={examCount}
                                    onChange={e => setExamCount(e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'} focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow`}
                                />
                                <button
                                    onClick={handleAIGenerate}
                                    disabled={isGenerating}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold flex shrink-0 items-center justify-center transition-colors disabled:opacity-50"
                                >
                                    {isGenerating ? 'Generating...' : 'Generate!'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {questions.length > 0 && (
                        <div className="border-t border-gray-700 pt-6 mt-6">
                            <h4 className="font-bold text-lg mb-2 text-indigo-400">Generated Blueprint</h4>
                            <div className="mb-4">
                                <label className="block text-xs text-gray-400 mb-1">Generated Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className={`w-full text-lg font-bold px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                                />
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-6">
                                {questions.map((q, i) => (
                                    <div key={i} className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                        <p className="font-bold text-sm mb-2">{i + 1}. {q.questionText}</p>
                                        <ul className="space-y-1 text-sm pl-4">
                                            {q.options.map((opt, oIdx) => (
                                                <li key={oIdx} className={q.correctOption === oIdx ? 'text-emerald-500 font-bold flex items-center gap-1' : 'text-gray-500'}>
                                                    {opt} {q.correctOption === oIdx && '✓'}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleCreateExam}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
                            >
                                Dispatch Exam to Students
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* List Exams */}
            {loading ? (
                <div className="w-full flex justify-center p-8"><span className="animate-pulse">Loading exams...</span></div>
            ) : exams.length === 0 ? (
                <div className={`p-8 text-center rounded-xl border ${darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                    No exams found for this class.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map(exam => (
                        <div key={exam._id} className={`p-6 rounded-2xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-indigo-500' : 'bg-white border-gray-200 hover:border-indigo-300'} transition-all group flex flex-col`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                                    <ShieldCheck size={24} />
                                </div>
                                {exam.proctoringConfig?.requireCamera && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 px-2 py-1 rounded flex items-center gap-1">
                                        <AlertTriangle size={12} /> Proctored
                                    </span>
                                )}
                            </div>

                            <h3 className="font-bold text-lg mb-1 truncate">{exam.title}</h3>
                            <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{exam.description}</p>

                            <div className="mt-auto pt-4 border-t border-gray-100/10 flex items-center justify-between">
                                <span className="text-xs font-mono text-gray-500">{exam.questions.length} Questions • {exam.duration}m</span>
                                <Link
                                    to={`/exam/${exam._id}`}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                >
                                    {isTeacher ? 'Preview' : 'Start Exam'}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExamsManager;
