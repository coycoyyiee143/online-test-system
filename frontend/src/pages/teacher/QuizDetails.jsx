import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, toggleQuizActive } from '../../services/quizService';
import { getQuestionsByQuiz, deleteQuestion } from '../../services/questionService';
import { getSessionsByQuiz } from '../../services/sessionService';
import { getViolationsByQuiz } from '../../services/violationService';
import Navbar from '../../components/teacher/Navbar';
import QuestionForm from '../../components/teacher/QuestionForm';

const QuizDetails = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [violations, setViolations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('questions');
  const navigate = useNavigate();

  const fetchQuiz = useCallback(async () => {
    try {
      const data = await getQuiz(id);
      setQuiz(data);
    } catch (e) {}
  }, [id]);

  const fetchQuestions = useCallback(async () => {
    try {
      const data = await getQuestionsByQuiz(id);
      setQuestions(data);
    } catch (e) {}
  }, [id]);

  const fetchParticipants = useCallback(async () => {
    try {
      const data = await getSessionsByQuiz(id);
      setParticipants(data);
    } catch (e) {}
  }, [id]);

  const fetchViolations = useCallback(async () => {
    try {
      const data = await getViolationsByQuiz(id);
      setViolations(data);
    } catch (e) {}
  }, [id]);

  useEffect(() => {
    fetchQuiz();
    fetchQuestions();
    fetchParticipants();
    fetchViolations();

    const interval = setInterval(() => {
      fetchParticipants();
      fetchViolations();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchQuiz, fetchQuestions, fetchParticipants, fetchViolations]);

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteQuestion(questionId);
      fetchQuestions();
    } catch (e) {}
  };

  const handleToggle = async () => {
    try {
      await toggleQuizActive(id, quiz.isActive);
      fetchQuiz();
    } catch (e) {}
  };

  const activeCount = participants.filter((p) => p.status === 'active').length;
  const submittedCount = participants.filter((p) => p.status === 'submitted').length;

  if (!quiz) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <button
              className="btn btn-outline-secondary btn-sm mb-2"
              onClick={() => navigate('/teacher/dashboard')}
            >
              ← Back
            </button>
            <h3 className="fw-bold mb-1">{quiz.title}</h3>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge bg-primary fs-6">Code: {quiz.quizCode}</span>
              <span className={`badge fs-6 ${quiz.isActive ? 'bg-success' : 'bg-secondary'}`}>
                {quiz.isActive ? '● Active' : '● Inactive'}
              </span>
              <span className="badge bg-info fs-6">⏱ {quiz.timeLimit} mins</span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              className={`btn ${quiz.isActive ? 'btn-warning' : 'btn-success'}`}
              onClick={handleToggle}
            >
              {quiz.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/teacher/quiz/${id}/results`)}
            >
              📊 Results
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Participants', value: participants.length, color: 'primary', icon: '👥' },
            { label: 'Currently Taking', value: activeCount, color: 'warning', icon: '✏️' },
            { label: 'Submitted', value: submittedCount, color: 'success', icon: '✅' },
            { label: 'Total Violations', value: violations.length, color: 'danger', icon: '⚠️' },
          ].map((stat) => (
            <div key={stat.label} className="col-6 col-md-3">
              <div className={`card border-${stat.color} shadow-sm text-center`}>
                <div className="card-body py-3">
                  <div className="fs-3">{stat.icon}</div>
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
            { key: 'questions', label: `❓ Questions (${questions.length})` },
            { key: 'participants', label: `👥 Participants (${participants.length})` },
            { key: 'violations', label: `⚠️ Violations (${violations.length})` },
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

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div>
            <button className="btn btn-primary mb-3" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ Add Question'}
            </button>
            {showForm && (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white fw-bold">Add New Question</div>
                <div className="card-body">
                  <QuestionForm quizId={id} onSuccess={() => { setShowForm(false); fetchQuestions(); }} />
                </div>
              </div>
            )}
            {questions.length === 0 ? (
              <div className="text-center text-muted mt-4">
                <div className="fs-1">📭</div>
                <p>No questions yet. Add your first question!</p>
              </div>
            ) : (
              questions.map((question, index) => (
                <div key={question.id} className="card shadow-sm mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <span className="badge bg-secondary me-2">Q{index + 1}</span>
                        <span className="badge bg-info me-2">{question.questionType}</span>
                        <span className="badge bg-warning text-dark">{question.points} pts</span>
                      </div>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteQuestion(question.id)}>
                        Delete
                      </button>
                    </div>
                    <p className="mt-2 mb-2 fw-bold">{question.questionText}</p>
                    <div className="d-flex flex-wrap gap-1">
                      {question.choices?.map((choice) => (
                        <span key={choice.id} className={`badge ${choice.isCorrect ? 'bg-success' : 'bg-light text-dark border'}`}>
                          {choice.isCorrect ? '✓ ' : ''}{choice.choiceText}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && (
          <div>
            <div className="d-flex justify-content-between mb-3">
              <small className="text-muted">Auto-refreshes every 10 seconds</small>
              <button className="btn btn-sm btn-outline-primary" onClick={fetchParticipants}>🔄 Refresh</button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover bg-white shadow-sm">
                <thead className="table-primary">
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>Section</th>
                    <th>Status</th>
                    <th>Violations</th>
                    <th>Started At</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-muted py-4">No participants yet</td></tr>
                  ) : (
                    participants.map((p, index) => (
                      <tr key={p.id}>
                        <td>{index + 1}</td>
                        <td>{p.studentName}</td>
                        <td>{p.studentId}</td>
                        <td>{p.section || '-'}</td>
                        <td>
                          <span className={`badge ${p.status === 'submitted' ? 'bg-success' : p.status === 'active' ? 'bg-primary' : 'bg-danger'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${p.violationCount > 0 ? 'bg-danger' : 'bg-secondary'}`}>
                            {p.violationCount}
                          </span>
                        </td>
                        <td>{p.startedAt?.toDate ? new Date(p.startedAt.toDate()).toLocaleTimeString() : '-'}</td>
                        <td>{p.submittedAt?.toDate ? new Date(p.submittedAt.toDate()).toLocaleTimeString() : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Violations Tab */}
        {activeTab === 'violations' && (
          <div>
            <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-sm btn-outline-danger" onClick={fetchViolations}>🔄 Refresh</button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover bg-white shadow-sm">
                <thead className="table-danger">
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Violation Type</th>
                    <th>Description</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-muted py-4">No violations recorded</td></tr>
                  ) : (
                    violations.map((v, index) => (
                      <tr key={v.id}>
                        <td>{index + 1}</td>
                        <td>{v.studentName || '-'}</td>
                        <td><span className="badge bg-danger">{v.violationType}</span></td>
                        <td>{v.description}</td>
                        <td>{v.violatedAt?.toDate ? new Date(v.violatedAt.toDate()).toLocaleTimeString() : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDetails;