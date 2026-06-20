import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const JoinQuiz = () => {
  const [quizCode, setQuizCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [section, setSection] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    // Show modal muna bago mag-proceed
    setShowModal(true);
  };

  const handleConfirmStart = async () => {
    if (!agreed) return;
    setShowModal(false);
    setPendingSubmit(true);

    try {
      const findRes = await api.post('/quiz/find', { quiz_code: quizCode });
      const quiz = findRes.data;

      const startRes = await api.post('/session/start', {
        quiz_id: quiz.quiz_id,
        student_name: studentName,
        student_id: studentId,
        section: section,
      });

      localStorage.setItem('session_token', startRes.data.session_token);
      localStorage.setItem('quiz_data', JSON.stringify(startRes.data));

      navigate('/quiz/take');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Invalid quiz code or quiz is not active';

      if (status === 403) {
        setError('⛔ ' + message);
      } else if (status === 404) {
        setError('❌ Quiz not found or is not active.');
      } else {
        setError('⚠️ ' + message);
      }
    } finally {
      setPendingSubmit(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">

      {/* Rules Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title fw-bold">⚠️ Quiz Rules & Warnings</h5>
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-3">
                  Please read the following rules carefully before starting the quiz.
                  Violations will be recorded and reported to your teacher.
                </p>

                <div className="mb-3">
                  <h6 className="fw-bold text-danger">🚫 Prohibited Actions</h6>
                  <ul className="small">
                    <li>Switching to another tab or window during the quiz</li>
                    <li>Minimizing or hiding the browser</li>
                    <li>Refreshing or closing the browser window</li>
                    <li>Copying or pasting any content</li>
                    <li>Right-clicking anywhere on the page</li>
                    <li>Using keyboard shortcuts (F12, Ctrl+U, Ctrl+S, etc.)</li>
                    <li>Exiting fullscreen mode</li>
                  </ul>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold text-primary">📋 Violation System</h6>
                  <ul className="small">
                    <li>Every prohibited action is recorded as a <strong>violation</strong></li>
                    <li><strong>1st violation</strong> — Warning shown</li>
                    <li><strong>2nd violation</strong> — Warning shown</li>
                    <li><strong>3rd violation</strong> — Quiz is <strong>automatically submitted</strong></li>
                    <li>All violations are visible to your teacher with timestamps</li>
                  </ul>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold text-success">✅ Good to Know</h6>
                  <ul className="small">
                    <li>Your answers are <strong>auto-saved</strong> as you answer</li>
                    <li>A timer is shown — submit before it runs out</li>
                    <li>If you accidentally refresh, you may resume your session</li>
                    <li>Ensure a <strong>stable internet connection</strong> before starting</li>
                    <li>The quiz will request <strong>fullscreen mode</strong> — please allow it</li>
                  </ul>
                </div>

                <div className="alert alert-danger small mb-0">
                  <strong>⚠️ Note:</strong> Any form of cheating will be reported to your teacher.
                  Make sure to answer honestly and independently.
                </div>
              </div>
              <div className="modal-footer flex-column align-items-stretch">
                <div className="form-check mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="agreeCheck"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <label className="form-check-label small fw-bold" htmlFor="agreeCheck">
                    I have read and understood all the rules. I agree to take this quiz honestly.
                  </label>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary w-50"
                    onClick={() => {
                      setShowModal(false);
                      setAgreed(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary w-50"
                    onClick={handleConfirmStart}
                    disabled={!agreed || pendingSubmit}
                  >
                    {pendingSubmit ? 'Starting...' : '🚀 Start Quiz'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Form */}
      <div className="card shadow p-4" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '50px' }}>📝</div>
          <h2 className="fw-bold text-primary">Join Quiz</h2>
          <p className="text-muted">Enter your details to start the quiz</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleJoin}>
          <div className="mb-3">
            <label className="form-label fw-bold">Quiz Code</label>
            <input
              type="text"
              className="form-control form-control-lg text-center text-uppercase"
              placeholder="Enter Quiz Code"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your full name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Student ID</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-bold">Section</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 3-IT-A"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 btn-lg"
            disabled={loading}
          >
            {loading ? 'Joining...' : '🚀 Join Quiz'}
          </button>
        </form>

        <div className="text-center mt-3">
          <small className="text-muted">
            Are you a teacher?{' '}
            <a href="/teacher/login" className="text-primary">Login here</a>
          </small>
        </div>
      </div>
    </div>
  );
};

export default JoinQuiz;