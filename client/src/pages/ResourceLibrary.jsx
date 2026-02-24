import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Video, Link as LinkIcon, File, Plus, Trash2, ExternalLink } from 'lucide-react';
import axios from 'axios';

const ResourceLibrary = () => {
    const { classId } = useParams();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newResource, setNewResource] = useState({ title: '', description: '', fileUrl: '', fileType: 'link' });

    const userInfo = React.useMemo(() => JSON.parse(localStorage.getItem('userInfo') || '{}'), []);
    const headers = React.useMemo(() => ({ Authorization: `Bearer ${userInfo.token}` }), [userInfo.token]);
    const isTeacher = userInfo.role === 'teacher' || userInfo.role === 'admin';

    const fetchResources = React.useCallback(async () => {
        try {
            const { data } = await axios.get(`https://server-mathananandhan58-4944s-projects.vercel.app/api/resources/class/${classId}`, { headers });
            setResources(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching resources:', error);
            setLoading(false);
        }
    }, [classId, headers]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (classId) fetchResources();
    }, [classId, fetchResources]);

    const handleAddResource = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://server-mathananandhan58-4944s-projects.vercel.app/api/resources', { classId, ...newResource }, { headers });
            setNewResource({ title: '', description: '', fileUrl: '', fileType: 'link' });
            setShowAddForm(false);
            fetchResources();
        } catch (error) {
            console.error('Error adding resource:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this resource?')) return;
        try {
            await axios.delete(`https://server-mathananandhan58-4944s-projects.vercel.app/api/resources/${id}`, { headers });
            fetchResources();
        } catch (error) {
            console.error('Error deleting resource:', error);
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            pdf: <FileText size={20} className="text-red-500" />,
            video: <Video size={20} className="text-blue-500" />,
            document: <FileText size={20} className="text-green-500" />,
            slides: <File size={20} className="text-orange-500" />,
            link: <LinkIcon size={20} className="text-indigo-500" />,
            other: <File size={20} className="text-gray-500" />
        };
        return icons[type] || icons.other;
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading resources...</div>;

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Resource Library</h2>
                {isTeacher && (
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Resource
                    </button>
                )}
            </div>

            {/* Add Resource Form */}
            {showAddForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Add New Resource</h3>
                    <form onSubmit={handleAddResource} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Resource title"
                            value={newResource.title}
                            onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                        <textarea
                            placeholder="Description (optional)"
                            value={newResource.description}
                            onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="url"
                                placeholder="URL (e.g., Google Drive link)"
                                value={newResource.fileUrl}
                                onChange={(e) => setNewResource(prev => ({ ...prev, fileUrl: e.target.value }))}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                            <select
                                value={newResource.fileType}
                                onChange={(e) => setNewResource(prev => ({ ...prev, fileType: e.target.value }))}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            >
                                <option value="link">Link</option>
                                <option value="pdf">PDF</option>
                                <option value="video">Video</option>
                                <option value="document">Document</option>
                                <option value="slides">Slides</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all">
                                Add Resource
                            </button>
                            <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Resources Grid */}
            {resources.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No resources shared yet.</p>
                    {isTeacher && <p className="text-gray-400 text-sm mt-2">Click "Add Resource" to share materials with your class.</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map((res) => (
                        <div key={res._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {getTypeIcon(res.fileType)}
                                    <div>
                                        <h4 className="font-bold text-gray-800">{res.title}</h4>
                                        <p className="text-xs text-gray-400 capitalize">{res.fileType}</p>
                                    </div>
                                </div>
                                {isTeacher && (
                                    <button onClick={() => handleDelete(res._id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            {res.description && <p className="text-sm text-gray-500 mb-3">{res.description}</p>}
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>By {res.uploadedBy?.name}</span>
                                <a
                                    href={res.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Open <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResourceLibrary;
