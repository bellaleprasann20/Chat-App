import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { useAuth } from './hooks/useAuth';
import Loader from './components/common/Loader';

// Pages
import Home from './pages/Home';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import DirectMessages from './pages/DirectMessages';
import DirectMessageChat from './pages/DirectMessageChat';
import RandomChat from './pages/RandomChat';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen message="Loading..." />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Auth Route Component (redirect if already authenticated)
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen message="Loading..." />;
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
};

// Auth Page Component
const AuthPage = () => {
  const [showRegister, setShowRegister] = useState(false);

  return showRegister ? (
    <Register onSwitch={() => setShowRegister(false)} />
  ) : (
    <Login onSwitch={() => setShowRegister(true)} />
  );
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <AuthPage />
          </AuthRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/chat/:roomId"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Direct Message Routes */}
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <DirectMessages />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dm/:dmId"
        element={
          <ProtectedRoute>
            <DirectMessageChat />
          </ProtectedRoute>
        }
      />

      {/* Random Chat Route */}
      <Route
        path="/random"
        element={
          <ProtectedRoute>
            <RandomChat />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <AppRoutes />
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;