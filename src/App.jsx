import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../Layout.jsx';

// Import pages
import Dashboard from '../pages/Dashboard.jsx';
import Interview from '../pages/Interview.jsx';
import AIAssistant from '../pages/AIAssistant.jsx';
import Review from '../pages/Review.jsx';
import Forms from '../pages/Forms.jsx';
import Documents from '../pages/Documents.jsx';
import Login from '../pages/Login.jsx';
import { useAuth } from './context/AuthProvider.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/Dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/Dashboard"
          element={
            <Protected>
              <Layout currentPageName="Dashboard">
                <Dashboard />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/Interview"
          element={
            <Protected>
              <Layout currentPageName="Interview">
                <Interview />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/Review"
          element={
            <Protected>
              <Layout currentPageName="Review">
                <Review />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/Forms"
          element={
            <Protected>
              <Layout currentPageName="Forms">
                <Forms />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/Documents"
          element={
            <Protected>
              <Layout currentPageName="Documents">
                <Documents />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/AIAssistant"
          element={
            <Protected>
              <Layout currentPageName="AI Assistant">
                <AIAssistant />
              </Layout>
            </Protected>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
