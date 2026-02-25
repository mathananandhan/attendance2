import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, ShieldCheck, Maximize } from 'lucide-react';

const ExamPortal = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
    const [warnings, setWarnings] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questionTimeLeft, setQuestionTimeLeft] = useState(60); // 60s per question strict limit
    const [userAnswers, setUserAnswers] = useState({});

    const logViolationToBackend = async (type, severity) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await fetch(`https://edutech-x60p.onrender.com/api/exams/${examId}/violation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ type, severity })
            });
        } catch (err) {
            console.error("Failed to log violation to backend", err);
        }
    };

    // Shuffle helper function
    const shuffleArray = (array) => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const headers = { 'Authorization': `Bearer ${userInfo.token}` };
                const res = await fetch(`https://edutech-x60p.onrender.com/api/exams/${examId}`, { headers });
                const data = await res.json();
                if (data.success && data.data) {
                    // Start of Anti-Cheat 5: Question & Option Shuffling
                    let fetchedQuestions = data.data.questions || [];
                    fetchedQuestions = shuffleArray(fetchedQuestions).map(q => {
                        // Shuffle options while keeping track of the correct answer string
                        const correctStr = q.options[q.correctOption];
                        const shuffledOptions = shuffleArray([...q.options]);
                        const newCorrectIndex = shuffledOptions.indexOf(correctStr);
                        return {
                            ...q,
                            options: shuffledOptions,
                            correctOption: newCorrectIndex
                        };
                    });

                    data.data.questions = fetchedQuestions;
                    setExamData(data.data);

                    // Use actual duration if provided for total timer
                    if (data.data.duration) {
                        setTimeLeft(data.data.duration * 60);
                    }
                }
            } catch (err) {
                console.error("Error fetching exam:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [examId]);

    // 1. Anti-Cheat: Tab Switch Detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setWarnings(prev => prev + 1);
                logViolationToBackend('tab_switch', 'high');
                alert("WARNING: Tab switching is monitored. This incident has been recorded.");
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    // 2. Anti-Cheat: Fullscreen Enforcement
    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
            setIsFullscreen(true);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
                setWarnings(prev => prev + 1);
                logViolationToBackend('fullscreen_exit', 'high');
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // 3. AI Proctoring (Video & Audio)
    useEffect(() => {
        const startProctoring = async () => {
            try {
                // Request both video and audio for proctoring
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                // Setup Audio Context for periodic sampling
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContext.createMediaStreamSource(stream);
                const processor = audioContext.createScriptProcessor(2048, 1, 1);

                source.connect(processor);
                processor.connect(audioContext.destination);

                let recentAudioData = new Float32Array(2048);

                processor.onaudioprocess = (e) => {
                    recentAudioData = new Float32Array(e.inputBuffer.getChannelData(0));
                };

                // Interval to catch Visual & Audio violations
                const interval = setInterval(async () => {
                    if (!canvasRef.current || !videoRef.current) return;
                    const context = canvasRef.current.getContext('2d');
                    context.drawImage(videoRef.current, 0, 0, 300, 200);
                    const imageData = canvasRef.current.toDataURL('image/jpeg');

                    try {
                        // Send Video to AI Service
                        const response = await fetch('https://edtech-ai-service.onrender.com/analyze_attention', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ image: imageData })
                        });
                        const data = await response.json();

                        if (data.flags && data.flags.length > 0) {
                            setWarnings(prev => prev + 1);
                            if (data.flags.includes('phone_detected')) {
                                logViolationToBackend('mobile_phone_detected', 'critical');
                                alert("CRITICAL WARNING: Mobile phone detected in frame. Incident recorded.");
                            } else if (data.flags.includes('no_face_detected')) {
                                logViolationToBackend('no_face', 'medium');
                            }
                        }

                        // Send Audio to AI Service
                        // Convert Float32Array to 16-bit PCM for simple energy detection
                        const pcmData = new Int16Array(recentAudioData.length);
                        for (let i = 0; i < recentAudioData.length; i++) {
                            const s = Math.max(-1, Math.min(1, recentAudioData[i]));
                            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                        }

                        // Convert PCM Int16Array to base64
                        const buffer = new Uint8Array(pcmData.buffer);
                        let binary = '';
                        for (let i = 0; i < buffer.byteLength; i++) {
                            binary += String.fromCharCode(buffer[i]);
                        }
                        const base64Audio = window.btoa(binary);

                        const audioResp = await fetch('https://edtech-ai-service.onrender.com/analyze_audio', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ audio: base64Audio })
                        });
                        const audioData = await audioResp.json();

                        if (audioData.flags && audioData.flags.includes("noise_detected")) {
                            setWarnings(prev => prev + 1);
                            console.warn("Audio violation detected!");
                        }

                    } catch (err) {
                        console.error("Proctoring AI Error:", err);
                    }
                }, 3000); // Check every 3 seconds

                return () => {
                    clearInterval(interval);
                    processor.disconnect();
                    source.disconnect();
                    if (audioContext.state !== 'closed') audioContext.close();
                    stream.getTracks().forEach(track => track.stop());
                };
            } catch (err) {
                console.error("Proctoring camera/mic failed:", err);
                alert("Camera and Microphone access are REQUIRED for this exam.");
            }
        };

        if (isFullscreen) {
            startProctoring();
        }
    }, [isFullscreen]);

    // Timer Logic (Global and Per-Question)
    useEffect(() => {
        if (!isFullscreen) return;

        const timer = setInterval(() => {
            // Global timer
            setTimeLeft(prev => {
                if (prev <= 1) {
                    submitExam();
                    return 0;
                }
                return prev - 1;
            });

            // Per-question strict timer
            setQuestionTimeLeft(prev => {
                if (prev <= 1) {
                    // Auto-advance
                    setCurrentQuestionIndex(currIdx => {
                        const nextIdx = currIdx + 1;
                        if (examData && nextIdx >= examData.questions.length) {
                            submitExam();
                            return currIdx;
                        }
                        return nextIdx;
                    });
                    // Reset question timer
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isFullscreen, examData, submitExam]);

    const submitExam = React.useCallback(async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch(`https://edutech-x60p.onrender.com/api/exams/${examId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({
                    answers: userAnswers,
                    warningsCount: warnings
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Exam Submitted! Your score: ${data.data.score}/${data.data.totalQuestions}. Violations Logged: ${data.data.violationsCount}`);
            } else {
                alert(data.message || "Failed to submit exam.");
            }
        } catch (err) {
            console.error("Error submitting exam:", err);
            alert("Error submitting exam. Please check your connection.");
        }

        if (document.fullscreenElement) document.exitFullscreen();
        navigate('/dashboard');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [examId, navigate, userAnswers, warnings]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading || !examData) {
        return <div className="flex h-screen items-center justify-center bg-gray-900 text-white animate-pulse text-2xl">Loading Secure Exam...</div>;
    }

    if (!isFullscreen) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
                <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-xl max-w-md">
                    <ShieldCheck size={64} className="mx-auto text-emerald-400 mb-6" />
                    <h2 className="text-2xl font-bold mb-4">Secure Exam Environment</h2>
                    <p className="text-gray-400 mb-6 font-semibold">
                        To start the exam, you must enter fullscreen mode. <br />
                        • Tab switching and multiple monitors are disabled.  <br />
                        • Camera AND Microphone will be active for AI analysis. <br />
                        • Questions are shuffled and have a strict 60-second time limit.
                    </p>
                    <button
                        onClick={enterFullscreen}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                    >
                        <Maximize size={20} />
                        Enter Exam Mode
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-200">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{examData.title}</h1>
                    <span className="text-sm text-gray-500">{examData.description}</span>
                </div>
                <div className="flex items-center gap-6">
                    {/* Strict Per-Question Timer */}
                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-lg font-mono font-bold animate-pulse">
                        <Clock size={18} />
                        {questionTimeLeft}s
                    </div>
                    <div className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-1 rounded-full">
                        <AlertTriangle size={18} />
                        <span className="font-bold">{warnings} Warnings</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xl font-mono font-bold">
                        <Clock size={20} />
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* 5. Dynamic Watermark - Deterrent against taking photos */}
                <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden opacity-[0.03] flex flex-wrap gap-12 justify-center items-center select-none">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div key={i} className="transform -rotate-45 text-2xl font-bold text-black whitespace-nowrap">
                            {JSON.parse(localStorage.getItem('userInfo'))?.email} • {JSON.parse(localStorage.getItem('userInfo'))?.name}
                        </div>
                    ))}
                </div>

                {/* Single Question Area */}
                <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full relative z-10">
                    {examData.questions && examData.questions[currentQuestionIndex] && (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-6 transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                    Question {currentQuestionIndex + 1} of {examData.questions.length}
                                </span>
                            </div>

                            <h3 className="font-bold text-xl mb-6 text-gray-800 leading-relaxed">
                                {examData.questions[currentQuestionIndex].questionText}
                            </h3>

                            <div className="space-y-4">
                                {examData.questions[currentQuestionIndex].options.map((opt, idx) => {
                                    const isSelected = userAnswers[currentQuestionIndex] === opt;
                                    return (
                                        <label key={idx} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group ${isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/30'}`}>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-indigo-500' : 'border-gray-300 group-hover:border-indigo-500'}`}>
                                                <div className={`w-3 h-3 rounded-full bg-indigo-500 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
                                            </div>
                                            <input
                                                type="radio"
                                                name={`question-${currentQuestionIndex}`}
                                                value={opt}
                                                checked={isSelected}
                                                onChange={() => setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: opt }))}
                                                className="hidden"
                                            />
                                            <span className="text-gray-700 font-medium">{opt}</span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => {
                                // Manual Advance
                                setCurrentQuestionIndex(currIdx => {
                                    const nextIdx = currIdx + 1;
                                    if (nextIdx >= examData.questions.length) {
                                        submitExam();
                                        return currIdx;
                                    }
                                    setQuestionTimeLeft(60); // reset strict timer
                                    return nextIdx;
                                });
                            }}
                            className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 font-bold py-4 rounded-xl hover:bg-indigo-50 transition-colors"
                        >
                            {currentQuestionIndex < examData.questions.length - 1 ? 'Next Question' : 'Finish & Submit'}
                        </button>
                    </div>
                </div>

                {/* Proctoring Sidebar */}
                <div className="w-64 bg-gray-900 text-white p-4 flex flex-col gap-4">
                    <div className="rounded-xl overflow-hidden border border-gray-700 relative">
                        <video ref={videoRef} autoPlay muted className="w-full h-40 object-cover opacity-80" />
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded text-xs text-green-400">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            LIVE
                        </div>
                        <canvas ref={canvasRef} width="300" height="200" className="hidden" />
                    </div>
                    <div className="text-sm text-gray-400">
                        <p className="mb-2">Proctoring Status:</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <ShieldCheck size={16} />
                                <span>Face Detected</span>
                            </div>
                            {warnings > 0 && <div className="text-red-400 flex items-center gap-2 text-xs">
                                <AlertTriangle size={14} />
                                <span>{warnings} Suspicious Activities</span>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamPortal;
