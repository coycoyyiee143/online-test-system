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
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>My Quizzes</h4>
            <p style={{ fontSize: '13px', color: '#888', margin: '4px 0 0 0' }}>
              Manage and monitor your quizzes
            </p>
          </div>
          <button
            onClick={() => navigate('/teacher/create-quiz')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderRadius: '8px',
              background: '#000',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            + Create Quiz
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Quizzes', value: quizzes.length },
            { label: 'Active', value: totalActive },
            { label: 'Inactive', value: quizzes.length - totalActive },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '16px 20px',
                border: '1px solid #e0e0e0',
                flex: 1,
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 2px 0', color: '#111' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '11px', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              outline: 'none',
              background: '#fff',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
            }}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Quiz List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{
              width: '32px', height: '32px',
              border: '3px solid #e0e0e0',
              borderTop: '3px solid #000',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>—</p>
            <p style={{ fontSize: '14px', margin: 0 }}>
              {quizzes.length === 0 ? 'No quizzes yet. Create your first quiz!' : 'No quizzes match your search.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filtered.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} onRefresh={fetchQuizzes} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;