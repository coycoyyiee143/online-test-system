import React, { useState, useEffect } from 'react';
import { getAllTeachers, approveTeacher, rejectTeacher, getAllQuizzes } from '../../services/adminService';
import AdminNavbar from '../../components/admin/Navbar';

const AdminDashboard = () => {
  const [teachers, setTeachers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [teachersData, quizzesData] = await Promise.all([
        getAllTeachers(),
        getAllQuizzes(),
      ]);
      setTeachers(teachersData);
      setQuizzes(quizzesData);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (uid) => {
    try { await approveTeacher(uid); fetchData(); } catch (e) {}
  };

  const handleReject = async (uid) => {
    if (!window.confirm('Are you sure you want to reject this teacher?')) return;
    try { await rejectTeacher(uid); fetchData(); } catch (e) {}
  };

  const pending = teachers.filter((t) => t.status === 'pending');
  const approved = teachers.filter((t) => t.status === 'approved');
  const rejected = teachers.filter((t) => t.status === 'rejected');

  const s = {
    page: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' },
    container: { maxWidth: '1000px', margin: '0 auto', padding: '28px 20px' },
    statCard: {
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e0e0e0',
      textAlign: 'center',
      flex: 1,
    },
    tableWrap: {
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #e0e0e0',
      overflow: 'hidden',
    },
    th: {
      padding: '12px 16px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#888',
      borderBottom: '1px solid #f0f0f0',
      textAlign: 'left',
      background: '#fafafa',
    },
    td: {
      padding: '14px 16px',
      fontSize: '13px',
      color: '#333',
      borderBottom: '1px solid #f5f5f5',
    },
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: '32px', height: '32px',
        border: '3px solid #e0e0e0',
        borderTop: '3px solid #000',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const tabs = [
    { key: 'pending', label: `Pending`, count: pending.length },
    { key: 'approved', label: `Approved`, count: approved.length },
    { key: 'rejected', label: `Rejected`, count: rejected.length },
    { key: 'quizzes', label: `Quizzes`, count: quizzes.length },
  ];

  const statusBadge = (status) => {
    const map = {
      pending: { bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
      approved: { bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
      rejected: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
    };
    const style = map[status] || map.pending;
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: '6px',
        padding: '3px 10px',
        fontSize: '12px',
        fontWeight: '600',
      }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div style={s.page}>
      <AdminNavbar />
      <div style={s.container}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Dashboard</h4>
          <p style={{ fontSize: '13px', color: '#888', margin: '4px 0 0 0' }}>
            Manage teachers and monitor quizzes
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Teachers', value: teachers.length },
            { label: 'Pending', value: pending.length },
            { label: 'Approved', value: approved.length },
            { label: 'Total Quizzes', value: quizzes.length },
          ].map((stat) => (
            <div key={stat.label} style={s.statCard}>
              <p style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 4px 0', color: '#111' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '11px', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '0',
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                fontWeight: activeTab === tab.key ? '700' : '500',
                color: activeTab === tab.key ? '#111' : '#888',
                cursor: 'pointer',
                borderBottom: activeTab === tab.key ? '2px solid #000' : '2px solid transparent',
                marginBottom: '-1px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {tab.label}
              <span style={{
                background: activeTab === tab.key ? '#000' : '#f0f0f0',
                color: activeTab === tab.key ? '#fff' : '#888',
                borderRadius: '999px',
                padding: '1px 7px',
                fontSize: '11px',
                fontWeight: '700',
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div>
            {pending.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#888' }}>
                <p style={{ fontSize: '14px' }}>No pending approvals</p>
              </div>
            ) : (
              pending.map((teacher) => (
                <div
                  key={teacher.uid}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px', margin: '0 0 2px 0' }}>
                      {teacher.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#888', margin: '0 0 6px 0' }}>
                      {teacher.email}
                    </p>
                    {statusBadge('pending')}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleApprove(teacher.uid)}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '7px',
                        background: '#000',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(teacher.uid)}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '7px',
                        background: '#fff',
                        color: '#333',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Approved Tab */}
        {activeTab === 'approved' && (
          <div style={s.tableWrap}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Name', 'Email', 'Status', 'Action'].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {approved.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#aaa', padding: '32px' }}>
                      No approved teachers
                    </td>
                  </tr>
                ) : (
                  approved.map((teacher, index) => (
                    <tr key={teacher.uid}>
                      <td style={s.td}>{index + 1}</td>
                      <td style={{ ...s.td, fontWeight: '600' }}>{teacher.name}</td>
                      <td style={s.td}>{teacher.email}</td>
                      <td style={s.td}>{statusBadge('approved')}</td>
                      <td style={s.td}>
                        <button
                          onClick={() => handleReject(teacher.uid)}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            background: '#fff',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Rejected Tab */}
        {activeTab === 'rejected' && (
          <div style={s.tableWrap}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Name', 'Email', 'Status', 'Action'].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rejected.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#aaa', padding: '32px' }}>
                      No rejected teachers
                    </td>
                  </tr>
                ) : (
                  rejected.map((teacher, index) => (
                    <tr key={teacher.uid}>
                      <td style={s.td}>{index + 1}</td>
                      <td style={{ ...s.td, fontWeight: '600' }}>{teacher.name}</td>
                      <td style={s.td}>{teacher.email}</td>
                      <td style={s.td}>{statusBadge('rejected')}</td>
                      <td style={s.td}>
                        <button
                          onClick={() => handleApprove(teacher.uid)}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            background: '#000',
                            color: '#fff',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div style={s.tableWrap}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Title', 'Quiz Code', 'Status', 'Time Limit'].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quizzes.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#aaa', padding: '32px' }}>
                      No quizzes yet
                    </td>
                  </tr>
                ) : (
                  quizzes.map((quiz, index) => (
                    <tr key={quiz.id}>
                      <td style={s.td}>{index + 1}</td>
                      <td style={{ ...s.td, fontWeight: '600' }}>{quiz.title}</td>
                      <td style={s.td}>
                        <span style={{
                          background: '#f0f0f0',
                          borderRadius: '6px',
                          padding: '3px 10px',
                          fontSize: '12px',
                          fontWeight: '700',
                          letterSpacing: '1px',
                        }}>
                          {quiz.quizCode}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{
                          background: quiz.isActive ? '#f0fdf4' : '#fafafa',
                          color: quiz.isActive ? '#16a34a' : '#888',
                          border: `1px solid ${quiz.isActive ? '#86efac' : '#e0e0e0'}`,
                          borderRadius: '6px',
                          padding: '3px 10px',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}>
                          {quiz.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={s.td}>{quiz.timeLimit} mins</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;