import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Classroom from './pages/Classroom';
import ExamPortal from './pages/ExamPortal';
import AdminDashboard from './pages/AdminDashboard';
import ParentPortal from './pages/ParentPortal';
import JoinClass from './pages/JoinClass';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join/:code" element={<JoinClass />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/classroom/:id" element={<Classroom />} />
            <Route path="/exam/:examId" element={<ExamPortal />} />
            <Route path="/parent-portal" element={<ParentPortal />} />
            <Route path="/parent-portal/:studentId" element={<ParentPortal />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
