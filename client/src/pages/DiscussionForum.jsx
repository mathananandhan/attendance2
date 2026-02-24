import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Send, Pin } from 'lucide-react';
import axios from 'axios';

const DiscussionForum = () => {
    const { classId } = useParams();
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [replyContent, setReplyContent] = useState({});
    const [expandedThread, setExpandedThread] = useState(null);
    const [showNewForm, setShowNewForm] = useState(false);

    const userInfo = React.useMemo(() => JSON.parse(localStorage.getItem('userInfo') || '{}'), []);
    const headers = React.useMemo(() => ({ Authorization: `Bearer ${userInfo.token}` }), [userInfo.token]);

    const fetchDiscussions = React.useCallback(async () => {
        try {
            const { data } = await axios.get(`https://edutech-x60p.onrender.com/api/discussions/class/${classId}`, { headers });
            setDiscussions(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching discussions:', error);
            setLoading(false);
        }
    }, [classId, headers]);

    useEffect(() => {
        if (classId) fetchDiscussions();
    }, [classId, fetchDiscussions]);

    const handleCreateDiscussion = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://edutech-x60p.onrender.com/api/discussions', { classId, title: newTitle, content: newContent }, { headers });
            setNewTitle('');
            setNewContent('');
            setShowNewForm(false);
            fetchDiscussions();
        } catch (error) {
            console.error('Error creating discussion:', error);
        }
    };

    const handleReply = async (discussionId) => {
        const content = replyContent[discussionId];
        if (!content?.trim()) return;
        try {
            await axios.post(`https://edutech-x60p.onrender.com/api/discussions/${discussionId}/reply`, { content }, { headers });
            setReplyContent(prev => ({ ...prev, [discussionId]: '' }));
            fetchDiscussions();
        } catch (error) {
            console.error('Error replying:', error);
        }
    };

    const handleUpvote = async (discussionId) => {
        try {
            await axios.put(`https://edutech-x60p.onrender.com/api/discussions/${discussionId}/upvote`, {}, { headers });
            fetchDiscussions();
        } catch (error) {
            console.error('Error upvoting:', error);
        }
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime(); // eslint-disable-line react-hooks/purity
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading discussions...</div>;

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Discussion Forum</h2>
                <button
                    onClick={() => setShowNewForm(!showNewForm)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                >
                    <MessageSquare size={18} />
                    New Thread
                </button>
            </div>

            {/* New Thread Form */}
            {showNewForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Start a New Discussion</h3>
                    <form onSubmit={handleCreateDiscussion} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Discussion title..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                        <textarea
                            placeholder="What would you like to discuss?"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                            required
                        />
                        <div className="flex gap-2">
                            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all">
                                Post Discussion
                            </button>
                            <button type="button" onClick={() => setShowNewForm(false)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Discussion Threads */}
            {discussions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No discussions yet. Start the conversation!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {discussions.map((disc) => (
                        <div key={disc._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <button
                                            onClick={() => handleUpvote(disc._id)}
                                            className={`p-2 rounded-lg transition-colors ${disc.upvotes?.includes(userInfo._id) ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-400'}`}
                                        >
                                            <ThumbsUp size={18} />
                                        </button>
                                        <span className="text-sm font-bold text-gray-600">{disc.upvotes?.length || 0}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {disc.isPinned && <Pin size={14} className="text-indigo-600" />}
                                            <h3
                                                className="font-bold text-lg text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors"
                                                onClick={() => setExpandedThread(expandedThread === disc._id ? null : disc._id)}
                                            >
                                                {disc.title}
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-2">{disc.content}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            <span className="font-medium text-gray-500">{disc.authorId?.name}</span>
                                            <span>{disc.authorId?.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}</span>
                                            <span>{timeAgo(disc.createdAt)}</span>
                                            <button
                                                onClick={() => setExpandedThread(expandedThread === disc._id ? null : disc._id)}
                                                className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                                            >
                                                <MessageSquare size={12} />
                                                {disc.replies?.length || 0} replies
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Replies */}
                            {expandedThread === disc._id && (
                                <div className="border-t border-gray-100 bg-gray-50">
                                    {disc.replies?.map((reply, idx) => (
                                        <div key={idx} className="p-4 border-b border-gray-100 ml-12">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm text-gray-700">{reply.authorId?.name}</span>
                                                <span className="text-xs text-gray-400">{reply.authorId?.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'}</span>
                                                <span className="text-xs text-gray-400">{timeAgo(reply.createdAt)}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{reply.content}</p>
                                        </div>
                                    ))}
                                    <div className="p-4 ml-12 flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Write a reply..."
                                            value={replyContent[disc._id] || ''}
                                            onChange={(e) => setReplyContent(prev => ({ ...prev, [disc._id]: e.target.value }))}
                                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            onKeyDown={(e) => e.key === 'Enter' && handleReply(disc._id)}
                                        />
                                        <button
                                            onClick={() => handleReply(disc._id)}
                                            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DiscussionForum;
