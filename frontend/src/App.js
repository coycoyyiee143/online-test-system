import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuizProvider } from './context/QuizContext';
import PrivateRoute from './components/shared/PrivateRoute';

// Student Pages
import JoinQuiz from './pages/student/JoinQuiz';
import TakeQuiz from './pages/student/TakeQuiz';
import QuizResult from './pages/student/QuizResult';

// Teacher Pages
import Login from './pages/teacher/Login';
import Register from './pages/teacher/Register';
import Dashboard from './pages/teacher/Dashboard';
import CreateQuiz from './pages/teacher/CreateQuiz';
import QuizDetails from './pages/teacher/QuizDetails';
import Results from './pages/teacher/Results';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';

// Shared
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <Router>
          <Routes>
            {/* Student Routes */}
            <Route path="/" element={<JoinQuiz />} />
            <Route path="/quiz/take" element={<TakeQuiz />} />
            <Route path="/quiz/result" element={<QuizResult />} />

            {/* Teacher Auth */}
            <Route path="/teacher/login" element={<Login />} />
            <Route path="/teacher/register" element={<Register />} />

            {/* Teacher Protected Routes */}
            <Route path="/teacher/dashboard" element={
              <PrivateRoute role="teacher"><Dashboard /></PrivateRoute>
            } />
            <Route path="/teacher/create-quiz" element={
              <PrivateRoute role="teacher"><CreateQuiz /></PrivateRoute>
            } />
            <Route path="/teacher/quiz/:id" element={
              <PrivateRoute role="teacher"><QuizDetails /></PrivateRoute>
            } />
            <Route path="/teacher/quiz/:id/results" element={
              <PrivateRoute role="teacher"><Results /></PrivateRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </QuizProvider>
    </AuthProvider>
  );
}

export default App;