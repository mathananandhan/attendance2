import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mic, Video, PhoneOff, MessageSquare, Hand, FileText, Download, ExternalLink } from 'lucide-react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { io } from 'socket.io-client';

const Classroom = () => {
    const { id } = useParams();

    const [attentionScore, setAttentionScore] = useState(100);
    const [flags, setFlags] = useState([]);
    const [gesture, setGesture] = useState("none");
    const canvasRef = useRef(null);

    // Chat State
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const socketRef = useRef(null);

    // Quiz State
    const [quizTopic, setQuizTopic] = useState("");
    const [questions, setQuestions] = useState([]);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [quizTimeRemaining, setQuizTimeRemaining] = useState(0);
    const [isStudentQuizActive, setIsStudentQuizActive] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

    // Live Attendance from Sockets
    const [liveAttendance, setLiveAttendance] = useState({});

    useEffect(() => {
        const socket = io('https://edutech-x60p.onrender.com');
        socketRef.current = socket;
        socket.emit('join-class', { classId: id, userId: userInfo._id, role: userInfo.role });

        socket.on('attendance-update', (data) => {
            setLiveAttendance(prev => ({
                ...prev,
                [data.studentId]: {
                    name: data.studentName,
                    score: data.attentionScore,
                    flags: data.proctoringFlags || []
                }
            }));
        });

        socket.on('quiz-started', ({ questions, topic }) => {
            if (userInfo.role !== 'teacher' && userInfo.role !== 'faculty') {
                setQuestions(questions);
                setQuizTopic(topic || "Live Concept Quiz");
                setUserAnswers({});
                setQuizResult(false);
                setQuizScore(0);
                setIsStudentQuizActive(true);
                setQuizTimeRemaining(60); // 60 seconds quick quiz
            }
        });

        socket.on('receive-chat-message', (data) => {
            setChatMessages(prev => [...prev, data]);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        }
    }, [id, userInfo._id, userInfo.role]);

    const handleSendMessage = (e) => {
        if (e.key === 'Enter' && chatInput.trim() !== '') {
            socketRef.current?.emit('send-chat-message', {
                classId: id,
                message: chatInput,
                senderName: userInfo.name || 'User',
                senderRole: userInfo.role,
                senderId: userInfo._id
            });
            setChatInput("");
        }
    };

    const handleGenerateQuiz = async () => {
        if (!quizTopic) return;
        setLoadingQuiz(true);
        try {
            const response = await fetch('https://edtech-ai-service.onrender.com/generate_quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: quizTopic })
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setQuestions(data);
                setQuizStarted(true);
                setUserAnswers({});
            } else {
                console.error("Invalid quiz format received", data);
            }
        } catch (error) {
            console.error("Error generating quiz:", error);
        }
        setLoadingQuiz(false);
    };

    const handleAnswerChange = (questionId, option) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleSubmitQuiz = async () => {
        let score = 0;
        questions.forEach(q => {
            if (userAnswers[q.id] === q.correctAnswer) {
                score += 1;
            }
        });
        setQuizScore(score);
        setQuizResult(true);
        setQuizStarted(false);
        setIsStudentQuizActive(false);

        // API Submission for Students
        if (userInfo.role !== 'teacher' && userInfo.role !== 'faculty') {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
                await fetch('https://edutech-x60p.onrender.com/api/quizzes/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        classId: id,
                        quizTopic: quizTopic || "Live Concept Quiz",
                        score: score,
                        totalPoints: questions.length
                    })
                });
            } catch (err) {
                console.error("Failed to submit quiz score", err);
            }
        }
    };

    useEffect(() => {
        let timer;
        if (isStudentQuizActive && quizTimeRemaining > 0) {
            timer = setInterval(() => {
                setQuizTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (isStudentQuizActive && quizTimeRemaining === 0) {
            handleSubmitQuiz(); // Auto submit when time is up
        }
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStudentQuizActive, quizTimeRemaining]);

    // Live Smart Notes State
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [notes, setNotes] = useState([]); // Array of note strings
    const [language, setLanguage] = useState("en-US");
    const recognitionRef = useRef(null);
    const transcriptBufferRef = useRef(""); // Buffer to hold text before sending to AI

    const languages = [
        { code: "en-US", name: "English (US)" },
        { code: "en-IN", name: "English (India)" },
        { code: "ta-IN", name: "Tamil" },
        { code: "hi-IN", name: "Hindi" },
        { code: "es-ES", name: "Spanish" },
        { code: "fr-FR", name: "French" },
    ];

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.error("Browser does not support Speech Recognition");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onresult = (event) => {
            let finalTranscriptHeader = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscriptHeader += event.results[i][0].transcript;
                    transcriptBufferRef.current += " " + event.results[i][0].transcript;
                } else {
                    // interim transcript
                }
            }
            // Update UI with scrolling text
            setTranscript(prev => (prev + finalTranscriptHeader).slice(-500)); // Keep last 500 chars for UI
        };

        recognition.onend = () => {
            if (isListening) {
                recognition.start(); // Restart if it stopped unexpectedly but we want it on
            }
        };

        recognitionRef.current = recognition;

        // Timer to send buffer to AI every 30 seconds
        const notesInterval = setInterval(async () => {
            if (transcriptBufferRef.current.length > 50) { // Only send if we have enough content
                const textToSend = transcriptBufferRef.current;
                transcriptBufferRef.current = ""; // Clear buffer

                try {
                    const response = await fetch('https://edtech-ai-service.onrender.com/generate_notes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: textToSend, language })
                    });
                    const data = await response.json();
                    if (data.notes) {
                        setNotes(prev => [...prev, data.notes]);
                    }
                } catch (err) {
                    console.error("Error generating notes:", err);
                    // If failed, maybe put text back in buffer? For now, we risk losing it to keep it simple.
                }
            }
        }, 30000);

        return () => {
            clearInterval(notesInterval);
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [isListening, language]);

    // Homework & Resources State
    const [sidebarTab, setSidebarTab] = useState('chat'); // chat, notes, homework, quiz, resources
    const [assignments, setAssignments] = useState([]);
    const [resources, setResources] = useState([]);
    const [hwTopic, setHwTopic] = useState('');
    const [hwDesc, setHwDesc] = useState('');
    const [hwDate, setHwDate] = useState('');

    useEffect(() => {
        // Fetch assignments & resources for this class
        const fetchData = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo) return;

                const headers = { 'Authorization': `Bearer ${userInfo.token}` };

                if (sidebarTab === 'homework') {
                    const { data } = await fetch(`https://edutech-x60p.onrender.com/api/assignments/${id}`, { headers }).then(res => res.json());
                    setAssignments(data || []);
                }

                if (sidebarTab === 'resources') {
                    const { data } = await fetch(`https://edutech-x60p.onrender.com/api/resources/class/${id}`, { headers }).then(res => res.json());
                    setResources(data || []);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };
        if (sidebarTab === 'homework' || sidebarTab === 'resources') fetchData();
    }, [id, sidebarTab]);

    const [isGeneratingAIAssignment, setIsGeneratingAIAssignment] = useState(false);

    const handleCreateHomework = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await fetch('https://edutech-x60p.onrender.com/api/assignments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({
                    classId: id,
                    title: hwTopic, // Using title as topic summary
                    topic: hwTopic,
                    description: hwDesc,
                    dueDate: hwDate
                })
            });
            // Refresh
            const { data } = await fetch(`https://edutech-x60p.onrender.com/api/assignments/${id}`, {
                headers: { 'Authorization': `Bearer ${userInfo.token}` }
            }).then(res => res.json());
            setAssignments(data || []);
            setHwTopic('');
            setHwDesc('');
            setHwDate('');
        } catch (err) {
            console.error("Error creating assignment:", err);
        }
    };

    const handleGenerateAssignmentAI = async () => {
        if (!hwTopic) {
            alert("Please enter a topic first to generate an assignment.");
            return;
        }
        setIsGeneratingAIAssignment(true);
        try {
            const response = await fetch('https://edtech-ai-service.onrender.com/generate_assignment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: hwTopic })
            });
            const data = await response.json();
            if (data.description) {
                setHwDesc(data.description);
                if (data.title && !hwTopic.includes(data.title)) {
                    setHwTopic(`${hwTopic} - ${data.title}`);
                }
            }
        } catch (err) {
            console.error("Error generating AI assignment:", err);
            alert("Failed to generate AI assignment.");
        }
        setIsGeneratingAIAssignment(false);
    };

    // Capture and analyze frame
    useEffect(() => {
        const currentCanvas = canvasRef.current;

        // Start separate webcam stream for AI analysis
        const startAIStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const video = document.createElement('video');
                video.muted = true;
                video.playsInline = true;
                video.srcObject = stream;

                // Wait for metadata to load to ensure width/height are available
                video.onloadedmetadata = () => {
                    video.play();
                };

                const interval = setInterval(async () => {
                    if (!currentCanvas || video.videoWidth === 0) return;

                    const context = currentCanvas.getContext('2d');
                    currentCanvas.width = video.videoWidth;
                    currentCanvas.height = video.videoHeight;
                    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

                    const imageData = currentCanvas.toDataURL('image/jpeg');

                    try {
                        // Send to AI Service
                        const response = await fetch('https://edtech-ai-service.onrender.com/analyze_attention', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ image: imageData })
                        });
                        const data = await response.json();
                        if (data.score !== undefined) {
                            setAttentionScore(data.score);
                            setFlags(data.flags);

                            // Send to Backend (Record Attendance)
                            // Only send every 3rd check (approx every 9-10 seconds) to reduce DB load
                            // For demo purposes, we do it here. In prod, use a counter.
                            try {
                                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                await fetch('https://edutech-x60p.onrender.com/api/attendance/record', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${userInfo.token}`
                                    },
                                    body: JSON.stringify({
                                        classId: id, // In a real app, 'id' from params might need mapping to _id
                                        attentionScore: data.score,
                                        flags: data.flags,
                                        status: 'present'
                                    })
                                });
                            } catch (backendErr) {
                                console.error("Backend Error:", backendErr);
                            }
                        }
                    } catch (err) {
                        console.error("AI Service Error (Attention):", err);
                    }

                    // Check Gestures
                    try {
                        const response = await fetch('https://edtech-ai-service.onrender.com/analyze_gestures', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ image: imageData })
                        });
                        const data = await response.json();
                        if (data.gesture && data.gesture !== 'none' && data.confidence > 0.8) {
                            setGesture(data.gesture);

                            // Auto-hide gesture after 3 seconds
                            setTimeout(() => setGesture("none"), 3000);
                        }
                    } catch (err) {
                        console.error("AI Service Error (Gesture):", err);
                    }

                }, 1000); // Check every 1 second

                return () => {
                    clearInterval(interval);
                    stream.getTracks().forEach(track => track.stop());
                };
            } catch (err) {
                console.error("Camera access failed for AI:", err);
            }
        };

        // Delay AI stream start to ensure ZegoCloud gets camera priority first
        const timer = setTimeout(() => {
            const cleanup = startAIStream();
            if (currentCanvas) currentCanvas._cleanupAI = cleanup;
        }, 5000);

        return () => {
            clearTimeout(timer);
            if (currentCanvas?._cleanupAI) {
                currentCanvas._cleanupAI.then(stop => stop && stop());
            }
        };
    }, [id]);

    const displayName = userInfo.name || (userInfo.role === 'teacher' ? 'Teacher' : 'Student User');

    // Initialize ZegoCloud Meeting
    const myMeeting = async (element) => {
        if (!element) return;

        try {
            const appID = 1468285099;
            const serverSecret = "0a6c6c2bf3e0d929c7bb334234993d8b";
            const roomID = `EduPrime-Class-${id}`;
            const userID = userInfo._id || Math.random().toString(36).substring(7);

            // Generate Kit Token
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appID,
                serverSecret,
                roomID,
                userID,
                displayName
            );

            const isTeacher = userInfo.role === 'teacher' || userInfo.role === 'faculty';

            const zp = ZegoUIKitPrebuilt.create(kitToken);

            zp.joinRoom({
                container: element,
                scenario: {
                    mode: isTeacher ? ZegoUIKitPrebuilt.VideoConference : ZegoUIKitPrebuilt.LiveStreaming,
                    config: {
                        role: isTeacher ? ZegoUIKitPrebuilt.Host : ZegoUIKitPrebuilt.Audience,
                    },
                },
                showScreenSharingButton: isTeacher,
                showRoomDetailsButton: false,
                turnOnCameraWhenJoining: true,
                turnOnMicrophoneWhenJoining: isTeacher,
                showUserList: isTeacher,
                showPreJoinView: false,
                lowerLeftNotification: {
                    showUserJoinAndLeave: isTeacher,
                    showTextChat: true
                },
                layout: isTeacher ? "Auto" : "Sidebar",
                onUserCameraStateChanged: (users) => {
                    // Logic: Notify teacher if someone turns off the camera
                    if (isTeacher) {
                        users.forEach(u => {
                            if (!u.cameraOnOff) {
                                // Add a system flag to the local chat array
                                setFlags(prev => [...prev.slice(-4), `⚠️ ${u.userName} turned their camera off.`]);
                            }
                        });
                    }
                }
            });
        } catch (err) {
            console.error("ZegoCloud Initialization Error:", err);
        }
    };

    const handleDownloadNotes = () => {
        const printWindow = window.open('', '_blank');
        const notesHTML = notes.map(n => `<div style="margin-bottom: 10px;">${n.replace(/\n/g, '<br/>').replace(/- /g, '• ')}</div>`).join('');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Class AI Live Notes</title>
                    <style>
                        body { font-family: 'Segoe UI', sans-serif; padding: 40px; line-height: 1.6; color: #333; }
                        h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;}
                        .meta { color: #666; font-size: 12px; margin-bottom: 30px; }
                        .note-block { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #4f46e5; }
                    </style>
                </head>
                <body>
                    <h1>EduPrime - AI Generated Live Notes</h1>
                    <div class="meta">Captured Date: ${new Date().toLocaleString()}</div>
                    <div class="note-block">${notesHTML}</div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            {/* Hidden Canvas for AI Processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Video Area */}
            <div className="flex-1 relative bg-black">
                <div ref={myMeeting} className="w-full h-full" />
                {/* Gesture Overlay */}
                {gesture !== 'none' && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-indigo-600/90 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-bounce">
                        <span className="text-2xl">
                            {gesture === 'raise_hand' ? '✋' : '👍'}
                        </span>
                        <span className="font-bold text-lg">
                            {gesture === 'raise_hand' ? 'Hand Raised!' : 'Thumbs Up!'}
                        </span>
                    </div>
                )}
            </div>

            {/* Side Panel (Chat/Attention) */}
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <h3 className="font-bold mb-1">Live Chat</h3>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Online
                    </p>
                </div>

                {/* Sidebar Navigation */}
                <div className="flex border-t border-gray-700">
                    {(userInfo.role === 'teacher' || userInfo.role === 'faculty') && (
                        <button
                            onClick={() => setSidebarTab('students')}
                            className={`flex-[1] py-2 text-[10px] font-bold ${sidebarTab === 'students' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                            Monitor
                        </button>
                    )}
                    <button
                        onClick={() => setSidebarTab('chat')}
                        className={`flex-1 py-2 text-[10px] font-bold ${sidebarTab === 'chat' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => setSidebarTab('notes')}
                        className={`flex-1 py-2 text-[10px] font-bold ${sidebarTab === 'notes' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        Notes
                    </button>
                    <button
                        onClick={() => setSidebarTab('resources')}
                        className={`flex-1 py-2 text-[10px] font-bold ${sidebarTab === 'resources' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        Docs
                    </button>
                    <button
                        onClick={() => setSidebarTab('homework')}
                        className={`flex-1 py-2 text-[10px] font-bold ${sidebarTab === 'homework' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        HW
                    </button>
                    <button
                        onClick={() => setSidebarTab('quiz')}
                        className={`flex-1 py-2 text-[10px] font-bold ${sidebarTab === 'quiz' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        Quiz
                    </button>
                </div>

                {/* Content Area based on Tab */}
                <div className="flex-1 overflow-y-auto bg-gray-800 relative">

                    {/* AI MONITOR TAB */}
                    {sidebarTab === 'students' && (
                        <div className="p-4 flex flex-col h-full bg-gray-800">
                            <h3 className="font-bold mb-4 text-indigo-400">Live AI Monitor Dashboard</h3>
                            {Object.keys(liveAttendance).length === 0 ? (
                                <p className="text-xs text-gray-400 text-center">Waiting for students to connect cameras...</p>
                            ) : (
                                <div className="flex-1 overflow-y-auto space-y-2">
                                    {Object.values(liveAttendance).map((student, i) => (
                                        <div key={i} className="bg-gray-700 p-3 rounded flex justify-between items-center text-sm">
                                            <div>
                                                <p className="font-bold text-white">{student.name}</p>
                                                <p className="text-xs text-red-300">{(student.flags || []).length} Warnings</p>
                                            </div>
                                            <div className={`font-bold ${student.score > 80 ? 'text-emerald-400' : student.score > 50 ? 'text-yellow-400' : 'text-red-500'}`}>
                                                {Math.round(student.score)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* CHAT TAB */}
                    {sidebarTab === 'chat' && (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                                <div className="bg-gray-700/50 p-3 rounded-lg text-sm">
                                    <p className="font-bold text-indigo-400 text-xs mb-1">System</p>
                                    <p className="text-gray-300">Welcome to Class! Dept: {JSON.parse(localStorage.getItem('userInfo'))?.department}, Year: {JSON.parse(localStorage.getItem('userInfo'))?.year}</p>
                                </div>
                                {chatMessages.map((msg, i) => (
                                    <div key={i} className={`p-3 rounded-lg text-sm ${msg.senderId === userInfo._id ? 'bg-indigo-600/50' : 'bg-gray-700/50'}`}>
                                        <p className={`font-bold text-xs mb-1 ${msg.senderId === userInfo._id ? 'text-indigo-300' : 'text-emerald-400'}`}>
                                            {msg.senderName}
                                            {msg.senderRole === 'teacher' && <span className="ml-1 bg-yellow-500/20 text-yellow-500 px-1 py-0.5 rounded text-[10px]">Host</span>}
                                        </p>
                                        <p className="text-gray-200">{msg.message}</p>
                                    </div>
                                ))}
                                {flags.map((flag, i) => (
                                    <div key={i} className="bg-red-900/50 p-2 rounded text-xs text-red-200 border border-red-800">
                                        ⚠️ Alert: {flag.replace('_', ' ')}
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-gray-800 border-t border-gray-700">
                                <input
                                    type="text"
                                    placeholder="Type a message and press Enter..."
                                    className="w-full bg-gray-700 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={handleSendMessage}
                                />
                            </div>
                        </div>
                    )}


                    {/* NOTES TAB */}
                    {sidebarTab === 'notes' && (
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-indigo-400">Live Smart Notes</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDownloadNotes}
                                        disabled={notes.length === 0}
                                        className="text-white hover:text-indigo-300 disabled:opacity-50"
                                        title="Download as PDF"
                                    >
                                        <Download size={14} />
                                    </button>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="bg-gray-700 text-xs text-white rounded border-none outline-none py-1"
                                    >
                                        {languages.map(lang => (
                                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={toggleListening}
                                        className={`p-1.5 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-600 hover:bg-gray-500'}`}
                                        title={isListening ? "Stop Transcription" : "Start Transcription"}
                                    >
                                        <Mic size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="mb-3 text-xs text-gray-500 italic h-12 overflow-hidden border-l-2 border-gray-600 pl-2">
                                {transcript || "Listening for speech..."}
                            </div>
                            <div className="space-y-3">
                                {notes.length === 0 && <p className="text-xs text-gray-500 text-center mt-4">Notes will appear here automatically...</p>}
                                {notes.map((noteChunk, i) => (
                                    <div key={i} className="bg-gray-700/30 p-2 rounded text-sm text-gray-200 prose prose-invert max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: noteChunk.replace(/\n/g, '<br/>').replace(/- /g, '• ') }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* RESOURCES TAB */}
                    {sidebarTab === 'resources' && (
                        <div className="p-4">
                            <h3 className="font-bold mb-4 text-indigo-400">Class Resources</h3>
                            <div className="space-y-3">
                                {resources.length === 0 ? (
                                    <p className="text-xs text-gray-500 text-center">No resources shared yet.</p>
                                ) : (
                                    resources.map(res => (
                                        <div key={res._id} className="bg-gray-700 p-3 rounded hover:bg-gray-600 transition-colors">
                                            <div className="flex items-start justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={16} className="text-blue-400" />
                                                    <h4 className="font-bold text-sm text-white truncate max-w-[150px]">{res.title}</h4>
                                                </div>
                                                <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-2 truncate">{res.description || 'No description'}</p>
                                            <div className="flex items-center justify-between text-[10px] text-gray-500">
                                                <span>{res.fileType.toUpperCase()}</span>
                                                <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* HOMEWORK TAB */}
                    {sidebarTab === 'homework' && (
                        <div className="p-4 flex flex-col h-full">
                            <h3 className="font-bold mb-4 text-indigo-400">Daily Homework & Assignments</h3>

                            {/* Teacher Create Form */}
                            {JSON.parse(localStorage.getItem('userInfo'))?.role === 'teacher' && (
                                <div className="bg-gray-700/50 p-3 rounded mb-4">
                                    <h4 className="text-xs font-bold text-gray-300 mb-2">Assign Homework</h4>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Topic (e.g. Algebra)"
                                            className="w-full bg-gray-600 rounded px-2 py-1 text-xs outline-none text-white focus:ring-1 focus:ring-indigo-500"
                                            value={hwTopic} onChange={e => setHwTopic(e.target.value)}
                                        />
                                        <button
                                            onClick={handleGenerateAssignmentAI}
                                            disabled={isGeneratingAIAssignment}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 disabled:opacity-50"
                                            title="Auto-generate assignment based on topic"
                                        >
                                            <span className="text-[10px]">✨</span> {isGeneratingAIAssignment ? 'AI...' : 'AI Generate'}
                                        </button>
                                    </div>
                                    <textarea
                                        placeholder="Title/Description"
                                        rows="3"
                                        className="w-full bg-gray-600 rounded px-2 py-1 text-xs mb-2 outline-none text-white resize-none"
                                        value={hwDesc} onChange={e => setHwDesc(e.target.value)}
                                    />
                                    <input
                                        type="date"
                                        className="w-full bg-gray-600 rounded px-2 py-1 text-xs mb-2 outline-none text-white"
                                        value={hwDate} onChange={e => setHwDate(e.target.value)}
                                    />
                                    <button
                                        onClick={handleCreateHomework}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 rounded transition-colors"
                                    >
                                        Post Assignment
                                    </button>
                                </div>
                            )}

                            {/* List */}
                            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                                {assignments.length === 0 ? (
                                    <p className="text-xs text-gray-500 text-center">No homework assigned yet.</p>
                                ) : (
                                    assignments.map(ass => (
                                        <div key={ass._id} className="bg-gray-700 p-3 rounded border-l-4 border-indigo-500">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-sm text-white">{ass.title}</h4>
                                                    <p className="text-xs text-indigo-300 font-mono mb-1">{ass.topic}</p>
                                                </div>
                                                <span className="text-[10px] bg-gray-600 px-1.5 py-0.5 rounded text-gray-300">
                                                    Due: {new Date(ass.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{ass.description}</p>
                                            <div className="mt-2 text-right">
                                                <span className="text-[10px] text-gray-500">
                                                    {ass.submissions?.length || 0} Submissions
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* QUIZ TAB */}
                    {sidebarTab === 'quiz' && (
                        <div className="p-4">
                            <h3 className="font-bold mb-2 text-indigo-400">AI Quick Quiz</h3>
                            {!quizStarted && !quizResult && (
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={quizTopic}
                                        onChange={(e) => setQuizTopic(e.target.value)}
                                        placeholder="Enter topic (e.g. Algebra)"
                                        className="w-full bg-gray-700 border-none rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                                    />
                                    <button
                                        onClick={handleGenerateQuiz}
                                        disabled={loadingQuiz}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 rounded transition-colors disabled:opacity-50"
                                    >
                                        {loadingQuiz ? "Generating..." : "Generate Quiz"}
                                    </button>
                                </div>
                            )}

                            {quizStarted && (
                                <div className="space-y-4">
                                    {questions.map((q, index) => (
                                        <div key={q.id} className="text-sm">
                                            <p className="font-semibold mb-1">{index + 1}. {q.question}</p>
                                            <div className="flex flex-col gap-1">
                                                {q.options.map((opt, i) => (
                                                    <label key={i} className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-1 rounded">
                                                        <input
                                                            type="radio"
                                                            name={`q-${q.id}`}
                                                            value={opt}
                                                            onChange={() => handleAnswerChange(q.id, opt)}
                                                            className="accent-indigo-500"
                                                        />
                                                        <span className="text-gray-300">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={handleSubmitQuiz}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 rounded transition-colors mb-2"
                                    >
                                        Submit Answers
                                    </button>
                                    {(userInfo.role === 'teacher' || userInfo.role === 'faculty') && (
                                        <button
                                            onClick={() => {
                                                const socket = io('https://edutech-x60p.onrender.com');
                                                socket.emit('start-quiz', { classId: id, questions, topic: quizTopic });
                                                socket.disconnect();
                                                alert("Quiz broadcasted to all students!");
                                            }}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 rounded transition-colors"
                                        >
                                            Broadcast Quiz to Students
                                        </button>
                                    )}
                                </div>
                            )}

                            {quizResult && (
                                <div className="text-center animate-fade-in">
                                    <p className="text-lg font-bold mb-1">Score: {quizScore} / {questions.length}</p>
                                    <p className="text-sm text-gray-400 mb-3">
                                        {quizScore === questions.length ? "Perfect! 🎉" : "Good try!"}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setQuizStarted(false);
                                            setQuizResult(false);
                                            setQuestions([]);
                                            setQuizTopic("");
                                        }}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                                    >
                                        Start New Quiz
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* AI Attention Monitor (Real-time) - This remains outside the tabbed content */}
                <div className="p-4 bg-gray-900 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Attention Score</span>
                        <span className={`${attentionScore > 80 ? 'text-emerald-400' : attentionScore > 50 ? 'text-yellow-400' : 'text-red-500'} font-bold text-sm transition-colors duration-500`}>
                            {Math.round(attentionScore)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                            className={`${attentionScore > 80 ? 'bg-emerald-500' : attentionScore > 50 ? 'bg-yellow-500' : 'bg-red-500'} h-full transition-all duration-1000 ease-out`}
                            style={{ width: `${attentionScore}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Student Live Quiz Popup */}
            {isStudentQuizActive && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-indigo-500 shadow-2xl shadow-indigo-500/20">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                            <h2 className="text-xl font-bold text-indigo-400">Live Quiz: {quizTopic}</h2>
                            <div className="text-red-400 font-mono text-xl font-bold p-2 bg-red-400/10 rounded">
                                {Math.floor(quizTimeRemaining / 60)}:{(quizTimeRemaining % 60).toString().padStart(2, '0')}
                            </div>
                        </div>
                        <div className="space-y-6">
                            {questions.map((q, index) => (
                                <div key={q.id} className="text-sm">
                                    <p className="font-semibold mb-2 text-lg">{index + 1}. {q.question}</p>
                                    <div className="flex flex-col gap-2">
                                        {q.options.map((opt, i) => (
                                            <label key={i} className={`flex items-center gap-3 cursor-pointer p-3 rounded border transition-colors ${userAnswers[q.id] === opt ? 'bg-indigo-600/30 border-indigo-500' : 'bg-gray-700 border-transparent hover:bg-gray-600'}`}>
                                                <input
                                                    type="radio"
                                                    name={`spop-q-${q.id}`}
                                                    value={opt}
                                                    checked={userAnswers[q.id] === opt}
                                                    onChange={() => handleAnswerChange(q.id, opt)}
                                                    className="w-4 h-4 text-indigo-500 focus:ring-indigo-500 bg-gray-600 border-gray-500"
                                                />
                                                <span className="text-gray-200">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8">
                            <button
                                onClick={handleSubmitQuiz}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-600/30 transition-all text-lg"
                            >
                                Submit Answers
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Hidden canvas for AI Video Frame Capture */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default Classroom;
