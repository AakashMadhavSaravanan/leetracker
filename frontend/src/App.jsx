import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import TrainerDashboard from './pages/TrainerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TrainerNotes from './pages/TrainerNotes';
import StudentNotes from './pages/StudentNotes';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }
  
  const user = JSON.parse(userStr);
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'trainer' ? '/trainer' : '/student'} replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Trainer Routes */}
        <Route path="/trainer" element={<ProtectedRoute allowedRole="trainer"><Layout><TrainerDashboard /></Layout></ProtectedRoute>} />
        <Route path="/trainer/notes" element={<ProtectedRoute allowedRole="trainer"><Layout><TrainerNotes /></Layout></ProtectedRoute>} />
        
        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute allowedRole="student"><Layout><StudentDashboard /></Layout></ProtectedRoute>} />
        <Route path="/student/notes" element={<ProtectedRoute allowedRole="student"><Layout><StudentNotes /></Layout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
