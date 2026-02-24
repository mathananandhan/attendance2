import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, BookOpen, ShieldCheck, Video } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-6 bg-white shadow-sm">
                <div className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
                    <Monitor className="w-8 h-8" />
                    <span>EduPrime</span>
                </div>
                <div className="flex gap-4">
                    <Link to="/login" className="px-5 py-2 text-gray-600 hover:text-indigo-600 font-medium">Login</Link>
                    <Link to="/register" className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all shadow-lg hover:shadow-indigo-500/30">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="container mx-auto px-6 py-20 text-center lg:text-left grid lg:grid-cols-2 gap-12 items-center">
                <div>
                    <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight text-gray-900 mb-6">
                        The Future of <span className="text-indigo-600">Online Learning</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-lg">
                        Experience AI-powered classrooms with real-time attentiveness monitoring, secure exams, and seamless video conferencing.
                    </p>
                    <div className="flex gap-4 justify-center lg:justify-start">
                        <Link to="/register" className="px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-500/40">
                            Start Teaching Free
                        </Link>
                        <Link to="/demo" className="px-8 py-4 bg-white text-gray-700 text-lg font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                            View Demo
                        </Link>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                    <img
                        src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"
                        alt="Online Learning"
                        className="relative rounded-2xl shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-500"
                    />
                </div>
            </header>

            {/* Features Section */}
            <section className="bg-white py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose EduPrime?</h2>
                        <p className="text-gray-600">We combine cutting-edge AI with intuitive design to create the best learning environment.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Video className="w-8 h-8 text-indigo-500" />}
                            title="HD Video Classrooms"
                            desc="Crystal clear video calls integrated directly into your dashboard."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="w-8 h-8 text-emerald-500" />}
                            title="AI Proctoring"
                            desc="Advanced anti-cheat measures and secure exam environments."
                        />
                        <FeatureCard
                            icon={<Monitor className="w-8 h-8 text-purple-500" />}
                            title="Engagement Analytics"
                            desc="Real-time attentiveness tracking to improve student outcomes."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 group">
        <div className="mb-4 p-3 bg-white rounded-xl inline-block shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600">{desc}</p>
    </div>
);

export default LandingPage;
