import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentHistory } from '../../services/adminService';
import AdminNavbar from '../../components/admin/Navbar';

const StudentHistory = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getStudentHistory(studentId);
        setHistory(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [studentId]);

  const formatDateTime = (value) => {
    if (!value) return '-';
    if (value?.toDate) return new Date(value.toDate()).toLocaleString();
    return value;
  };

  const s = {
    page: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' },
    container: { maxWidth: '900px', margin: '0 auto', padding: '28px 20px' },
    tableWrap: { background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' },
    th: {
      padding: '12px 16px', fontSize: '11px', fontWeight: '700',
      textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888',
      borderBottom: '1px solid #f0f0f0', textAlign: 'left', background: '#fafafa',
    },
    td: { padding: '14px 16px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f5f5f5' },
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #e0e0e0', borderTop: '3px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const studentName = history[0]?.studentName || studentId;
  const totalQuizzes = history.length;
  const averagePercentage = totalQuizzes > 0
    ? Math.round((history.reduce((acc, r) => acc + (r.percentage || 0), 0) / totalQuizzes) * 100) / 100
    : 0;
  const totalViolations = history.reduce((acc, r) => acc + (r.totalViolations || 0), 0);

  return (
    <div style={s.page}>
      <AdminNavbar />
      <div style={s.container}>

        {/* Back */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={{ border: 'none', background: 'none', fontSize: '13px', color: '#888', cursor: 'pointer', padding: '0 0 16px 0', fontFamily: 'Inter, sans-serif' }}
        >
          ← Back to Dashboard
        </button>

        {/* Student Summary */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '20px 24px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>{studentName}</h4>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            Student ID: {studentId} — {history[0]?.section || 'No section'}
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Quizzes Taken', value: totalQuizzes },
              { label: 'Average Score', value: `${averagePercentage}%` },
              { label: 'Total Violations', value: totalViolations },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{ flex: 1, minWidth: '120px', background: '#fafafa', borderRadius: '10px', padding: '12px 16px', border: '1px solid #f0f0f0', textAlign: 'center' }}
              >
                <p style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 2px 0', color: '#111' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '11px', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz History */}
        <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888', marginBottom: '12px' }}>
          Quiz History
        </p>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa', background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
            <p style={{ fontSize: '14px', margin: 0 }}>No quiz history found for this student</p>
          </div>
        ) : (
          <div style={s.tableWrap}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Quiz', 'Teacher', 'Score', 'Percentage', 'Remarks', 'Violations', 'Date'].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((r, index) => (
                  <tr key={r.id}>
                    <td style={s.td}>{index + 1}</td>
                    <td style={{ ...s.td, fontWeight: '600' }}>
                      {r.quizTitle}
                      <span style={{ display: 'block', fontSize: '11px', color: '#aaa', fontWeight: '400' }}>
                        {r.quizCode}
                      </span>
                    </td>
                    <td style={s.td}>{r.teacherName}</td>
                    <td style={s.td}>{r.earnedPoints} / {r.totalPoints}</td>
                    <td style={s.td}>{r.percentage}%</td>
                    <td style={s.td}>
                      <span style={{
                        fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '6px',
                        background: r.remarks === 'Passed' ? '#f0fdf4' : '#fef2f2',
                        color: r.remarks === 'Passed' ? '#16a34a' : '#dc2626',
                        border: `1px solid ${r.remarks === 'Passed' ? '#86efac' : '#fca5a5'}`,
                      }}>
                        {r.remarks}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px',
                        background: r.totalViolations > 0 ? '#fef2f2' : '#fafafa',
                        color: r.totalViolations > 0 ? '#dc2626' : '#888',
                        border: `1px solid ${r.totalViolations > 0 ? '#fca5a5' : '#e0e0e0'}`,
                      }}>
                        {r.totalViolations || 0}
                      </span>
                    </td>
                    <td style={s.td}>{formatDateTime(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHistory;