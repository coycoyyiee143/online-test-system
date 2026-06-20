import React, { useState, useEffect } from 'react';
import { getAllTeachers, approveTeacher, rejectTeacher } from '../../services/adminService';
import { getAllQuizzes } from '../../services/adminService';
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (uid) => {
    try {
      await approveTeacher(uid);
      fetchData();
    } catch (e) {}
  };

  const handleReject = async (uid) => {
    if (!window.confirm('Are you sure you want to reject this teacher?')) return;
    try {
      await rejectTeacher(uid);
      fetchData();
    } catch (e) {}
  };

  const pending = teachers.filter((t) => t.status === 'pending');
  const approved = teachers.filter((t) => t.status === 'approved');
  const rejected = teachers.filter((t) => t.status === 'rejected');

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="spinner-border text-dark" />
    </div>
  );

  return (
    <div className="min-vh-100 bg-light">
      <AdminNavbar />
      <div className="container py-4">
        <h3 className="fw-bold mb-4">🛡️ Admin Dashboard</h3>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Teachers', value: teachers.length, color: 'primary', icon: '👨‍🏫' },
            { label: 'Pending Approval', value: pending.length, color: 'warning', icon: '⏳' },
            { label: 'Approved', value: approved.length, color: 'success', icon: '✅' },
            { label: 'Total Quizzes', value: quizzes.length, color: 'info', icon: '📝' },
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

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          {[
            { key: 'pending', label: `⏳ Pending (${pending.length})` },
            { key: 'approved', label: `✅ Approved (${approved.length})` },
            { key: 'rejected', label: `❌ Rejected (${rejected.length})` },
            { key: 'quizzes', label: `📝 All Quizzes (${quizzes.length})` },
          ].map((tab) => (
            <li key={tab.key} className="nav-item">
              <button
                className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div>
            {pending.length === 0 ? (
              <div className="text-center mt-4">
                <div className="fs-1">✅</div>
                <p className="text-muted">No pending approvals</p>
              </div>
            ) : (
              pending.map((teacher) => (
                <div key={teacher.uid} className="card shadow-sm mb-3">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-1">{teacher.name}</h6>
                      <small className="text-muted">{teacher.email}</small>
                      <br />
                      <span className="badge bg-warning mt-1">Pending</span>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApprove(teacher.uid)}
                      >
                        ✅ Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleReject(teacher.uid)}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Approved Tab */}
        {activeTab === 'approved' && (
          <div className="table-responsive">
            <table className="table table-hover bg-white shadow-sm">
              <thead className="table-success">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {approved.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted py-4">No approved teachers</td></tr>
                ) : (
                  approved.map((teacher, index) => (
                    <tr key={teacher.uid}>
                      <td>{index + 1}</td>
                      <td>{teacher.name}</td>
                      <td>{teacher.email}</td>
                      <td><span className="badge bg-success">Approved</span></td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleReject(teacher.uid)}
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
          <div className="table-responsive">
            <table className="table table-hover bg-white shadow-sm">
              <thead className="table-danger">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rejected.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted py-4">No rejected teachers</td></tr>
                ) : (
                  rejected.map((teacher, index) => (
                    <tr key={teacher.uid}>
                      <td>{index + 1}</td>
                      <td>{teacher.name}</td>
                      <td>{teacher.email}</td>
                      <td><span className="badge bg-danger">Rejected</span></td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleApprove(teacher.uid)}
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
          <div className="table-responsive">
            <table className="table table-hover bg-white shadow-sm">
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Quiz Code</th>
                  <th>Status</th>
                  <th>Time Limit</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted py-4">No quizzes yet</td></tr>
                ) : (
                  quizzes.map((quiz, index) => (
                    <tr key={quiz.id}>
                      <td>{index + 1}</td>
                      <td>{quiz.title}</td>
                      <td><span className="badge bg-primary">{quiz.quizCode}</span></td>
                      <td>
                        <span className={`badge ${quiz.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {quiz.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{quiz.timeLimit} mins</td>
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