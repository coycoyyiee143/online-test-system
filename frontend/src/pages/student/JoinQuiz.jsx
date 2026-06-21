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
      const quiz = await getQuizByCode(quizCode);
      if (!quiz) {
        setError('Invalid or inactive quiz code.');
        setPendingSubmit(false);
        return;
      }

      const { session, isResumed } = await startSession(
        quiz.id, studentName, studentId, section
      );

      let questions = await getQuestionsByQuiz(quiz.id);

      if (quiz.randomizeQuestions) {
        questions = questions.sort(() => Math.random() - 0.5);
      }
      if (quiz.randomizeChoices) {
        questions = questions.map((q) => ({
          ...q,
          choices: [...q.choices].sort(() => Math.random() - 0.5),
        }));
      }

      setCurrentQuiz(quiz);
      setCurrentSession({ ...session, isResumed });
      setQuestions(questions);
      navigate('/quiz/take');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setPendingSubmit(false);
    }
  };

  const inputStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    background: '#fff',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Rules Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '460px',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '24px 24px 16px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <h5 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>
                Before You Start
              </h5>
              <p style={{ fontSize: '13px', color: '#888', marginTop: '4px', marginBottom: 0 }}>
                Read the rules carefully before proceeding.
              </p>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px' }}>
              {[
                {
                  title: 'Prohibited Actions',
                  border: '#000',
                  items: [
                    'Switching tabs or windows',
                    'Minimizing or hiding the browser',
                    'Refreshing or closing the page',
                    'Copying, pasting, or right-clicking',
                    'Using keyboard shortcuts (F12, Ctrl+U, etc.)',
                  ],
                },
                {
                  title: 'Violation System',
                  border: '#555',
                  items: [
                    '1st violation — Warning',
                    '2nd violation — Warning',
                    '3rd violation — Quiz auto-submitted',
                    'All violations are logged and visible to your teacher',
                  ],
                },
                {
                  title: 'Good to Know',
                  border: '#aaa',
                  items: [
                    'Answers are auto-saved as you go',
                    'Timer is always visible on screen',
                    'Stable internet connection is required',
                    'Quiz will request fullscreen mode',
                  ],
                },
              ].map((section) => (
                <div
                  key={section.title}
                  style={{
                    background: '#fafafa',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    marginBottom: '10px',
                    borderLeft: `3px solid ${section.border}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      margin: '0 0 8px 0',
                    }}
                  >
                    {section.title}
                  </p>
                  <ul
                    style={{
                      fontSize: '13px',
                      color: '#444',
                      paddingLeft: '16px',
                      margin: 0,
                      lineHeight: '1.8',
                    }}
                  >
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '0 24px 24px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '14px',
                  border: agreed ? '2px solid #000' : '2px solid #e0e0e0',
                  borderRadius: '10px',
                  marginBottom: '14px',
                  transition: 'border-color 0.2s',
                }}
              >
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ marginTop: '2px', accentColor: '#000' }}
                />
                <span style={{ fontSize: '13px', color: '#333', lineHeight: '1.5' }}>
                  I have read and understood all the rules. I agree to take this quiz honestly.
                </span>
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setShowModal(false); setAgreed(false); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    background: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStart}
                  disabled={!agreed || pendingSubmit}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    background: agreed ? '#000' : '#d4d4d4',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: agreed ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    transition: 'background 0.2s',
                  }}
                >
                  {pendingSubmit ? 'Starting...' : 'Start Quiz'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Card */}
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '36px 32px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>Join Quiz</h2>
          <p style={{ fontSize: '13px', color: '#888', marginTop: '4px', marginBottom: 0 }}>
            Enter your details to get started
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#dc2626',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleJoin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Quiz Code</label>
            <input
              type="text"
              placeholder="Enter quiz code"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
              style={{
                ...inputStyle,
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: '700',
                letterSpacing: '6px',
              }}
              required
            />
          </div>

          <div style={{ height: '1px', background: '#f0f0f0', margin: '20px 0' }} />

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Student ID</label>
            <input
              type="text"
              placeholder="Enter your student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Section</label>
            <input
              type="text"
              placeholder="e.g. 3-IT-A"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '13px',
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '0.3px',
            }}
          >
            Join Quiz
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            Are you a teacher?{' '}
            <a
              href="/teacher/login"
              style={{ color: '#000', fontWeight: '600', textDecoration: 'none' }}
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinQuiz;