import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const JoinClass = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (code) {
            handleJoin(code);
        }
    }, [code, handleJoin]);

    const handleJoin = React.useCallback(async (classCode) => {
        setLoading(true);
        setError(null);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo) {
                navigate('/login');
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            await axios.post('/api/classes/join', { code: classCode }, config);
            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard/classes');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join class');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    {loading ? (
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </div>
                    ) : success ? (
                        <div className="flex flex-col items-center text-green-600">
                            <CheckCircle size={48} className="mb-4" />
                            <h2 className="text-2xl font-bold">Successfully Joined!</h2>
                            <p className="mt-2 text-gray-600">Redirecting to your classes...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center text-red-600">
                            <AlertCircle size={48} className="mb-4" />
                            <h2 className="text-xl font-bold">Error Joining Class</h2>
                            <p className="mt-2 text-gray-600">{error}</p>
                            <button
                                onClick={() => navigate('/dashboard/classes')}
                                className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Go Back
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <BookOpen size={48} className="text-indigo-600 mb-4" />
                            <h2 className="text-xl font-bold text-gray-900">Joining Class...</h2>
                            <p className="mt-2 text-gray-500">Please wait while we verify the code.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JoinClass;
