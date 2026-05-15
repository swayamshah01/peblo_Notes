import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Workspace } from './pages/Workspace';
import { Dashboard } from './pages/Dashboard';
import { PublicNote } from './pages/PublicNote';
import { Landing } from './pages/Landing';
import './index.css';

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={token ? <Navigate to="/dashboard" replace /> : <Signup />}
      />
      <Route path="/shared/:shareId" element={<PublicNote />} />

      {/* Protected routes */}
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <Workspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
