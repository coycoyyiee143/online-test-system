import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getQuizzesByTeacher } from '../../services/quizService';
import Navbar from '../../components/teacher/Navbar';
import QuizCard from '../../components/teacher/QuizCard';

const Dashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    try {
      const data = await getQuizzesByTeacher(user.uid);
      setQuizzes(data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchQuizzes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = quizzes.filter((q) => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && q.isActive) ||
      (filter === 'inactive' && !q.isActive);
    return matchSearch && matchFilter;
  });

  const totalActive = quizzes.filter((q) => q.isActive).length;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Quizzes', value: quizzes.length, color: 'primary', icon: '📝' },
            { label: 'Active Quizzes', value: totalActive, color: 'success', icon: '✅' },
          ].map((stat) => (
            <div key={stat.label} className="col-6 col-md-3">
              <div className={`card border-${stat.color} shadow-sm text-center`}>
                <div className="card-body py-3">
                  <div className="fs-2">{stat.icon}</div>
                  <div className={`fs-3 fw-bold text-${stat.color}`}>{stat.value}</div>
                  <small className="text-muted">{stat.label}</small>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">My Quizzes</h4>
          <button className="btn btn-primary" onClick={() => navigate('/teacher/create-quiz')}>
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