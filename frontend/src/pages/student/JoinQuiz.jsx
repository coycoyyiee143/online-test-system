import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizByCode } from '../../services/quizService';
import { startSession } from '../../services/sessionService';
import { getQuestionsByQuiz } from '../../services/questionService';
import { useQuiz } from '../../context/QuizContext';

const JoinQuiz = () => {
  const [quizCode, setQuizCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [section, setSection] = useState('');
  const [error, setError] = useState('');
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { setCurrentQuiz, setCurrentSession, setQuestions } = useQuiz();
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setShowModal(true);
  };

  const handleConfirmStart = async () => {
    if (!agreed) return;
    setShowModal(false);
    setPendingSubmit(true);

    try {
      // Find quiz by code
      const quiz = await getQuizByCode(quizCode);
      if (!quiz) {
        setError('❌ Invalid or inactive quiz code.');
        setPendingSubmit(false);
        return;
      }

      // Start session
      const { session, isResumed } = await startSession(
        quiz.id,
        studentName,
        studentId,
        section
      );

      // Get questions
      let questions = await getQuestionsByQuiz(quiz.id);

      // Randomize if needed
      if (quiz.randomizeQuestions) {
        questions = questions.sort(() => Math.random() - 0.5);
      }
      if (quiz.randomizeChoices) {
        questions = questions.map((q) => ({
          ...q,
          choices: [...q.choices].sort(() => Math.random() - 0.5),
        }));
      }

      // Save to context
      setCurrentQuiz(quiz);
      setCurrentSession({ ...session, isResumed });
      setQuestions(questions);

      navigate('/quiz/take');
    } catch (err) {
      setError('⛔ ' + (err.message || 'Something went wrong.'));
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
                </p>
                <div className="mb-3">
                  <h6 className="fw-bold text-danger">🚫 Prohibited Actions</h6>
                  <ul className="small">
                    <li>Switching to another tab or window</li>
                    <li>Minimizing or hiding the browser</li>
                    <li>Refreshing or closing the browser window</li>
                    <li>Copying or pasting any content</li>
                    <li>Right-clicking anywhere on the page</li>
                    <li>Using keyboard shortcuts (F12, Ctrl+U, etc.)</li>
                    <li>Exiting fullscreen mode</li>
                  </ul>
                </div>
                <div className="mb-3">
                  <h6 className="fw-bold text-primary">📋 Violation System</h6>
                  <ul className="small">
                    <li>Every prohibited action is recorded as a violation</li>
                    <li><strong>1st violation</strong> — Warning shown</li>
                    <li><strong>2nd violation</strong> — Warning shown</li>
                    <li><strong>3rd violation</strong> — Quiz auto-submitted</li>
                    <li>All violations visible to your teacher</li>
                  </ul>
                </div>
                <div className="mb-3">
                  <h6 className="fw-bold text-success">✅ Good to Know</h6>
                  <ul className="small">
                    <li>Answers are auto-saved as you go</li>
                    <li>Timer is shown — submit before it runs out</li>
                    <li>Stable internet connection required</li>
                    <li>Quiz will request fullscreen — please allow it</li>
                  </ul>
                </div>
                <div className="alert alert-danger small mb-0">
                  <strong>⚠️ Note:</strong> Any form of cheating will be reported to your teacher.
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
                    onClick={() => { setShowModal(false); setAgreed(false); }}
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
          >
            🚀 Join Quiz
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