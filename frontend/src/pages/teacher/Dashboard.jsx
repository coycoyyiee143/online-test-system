import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from '../../components/teacher/Navbar';
import QuizCard from '../../components/teacher/QuizCard';

const Dashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/quizzes');
      setQuizzes(res.data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const filtered = quizzes.filter((q) => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && q.is_active) ||
      (filter === 'inactive' && !q.is_active);
    return matchSearch && matchFilter;
  });

  const totalActive = quizzes.filter((q) => q.is_active).length;
  const totalQuestions = quizzes.reduce((acc, q) => acc + (q.questions_count || 0), 0);
  const totalSessions = quizzes.reduce((acc, q) => acc + (q.sessions_count || 0), 0);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Quizzes', value: quizzes.length, color: 'primary', icon: '📝' },
            { label: 'Active Quizzes', value: totalActive, color: 'success', icon: '✅' },
            { label: 'Total Questions', value: totalQuestions, color: 'info', icon: '❓' },
            { label: 'Total Sessions', value: totalSessions, color: 'warning', icon: '👥' },
          ].map((stat) => (
            <div key={stat.label} className="col-6 col-md-3">
              <div className={`card border-${stat.color} shadow-sm h-100`}>
                <div className="card-body text-center py-3">
                  <div className="fs-2 mb-1">{stat.icon}</div>
                  <div className={`fs-3 fw-bold text-${stat.color}`}>{stat.value}</div>
                  <small className="text-muted">{stat.label}</small>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <h4 className="fw-bold mb-0">My Quizzes</h4>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/teacher/create-quiz')}
          >
            + Create Quiz
          </button>
        </div>

        {/* Search and Filter */}
        <div className="row g-2 mb-4">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search quizzes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Quizzes</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Quiz List */}
        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center mt-5">
            <div className="fs-1">📭</div>
            <h5 className="text-muted mt-2">
              {quizzes.length === 0 ? 'No quizzes yet. Create your first quiz!' : 'No quizzes match your search.'}
            </h5>
          </div>
        ) : (
          <div className="row g-4">
            {filtered.map((quiz) => (
              <div key={quiz.id} className="col-md-6 col-lg-4">
                <QuizCard quiz={quiz} onRefresh={fetchQuizzes} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;