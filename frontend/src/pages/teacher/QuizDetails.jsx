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
    try { const data = await getQuiz(id); setQuiz(data); } catch (e) {}
  }, [id]);

  const fetchQuestions = useCallback(async () => {
    try { const data = await getQuestionsByQuiz(id); setQuestions(data); } catch (e) {}
  }, [id]);

  const fetchParticipants = useCallback(async () => {
    try { const data = await getSessionsByQuiz(id); setParticipants(data); } catch (e) {}
  }, [id]);

  const fetchViolations = useCallback(async () => {
    try { const data = await getViolationsByQuiz(id); setViolations(data); } catch (e) {}
  }, [id]);

  useEffect(() => {
    fetchQuiz(); fetchQuestions(); fetchParticipants(); fetchViolations();
    const interval = setInterval(() => { fetchParticipants(); fetchViolations(); }, 10000);
    return () => clearInterval(interval);
  }, [fetchQuiz, fetchQuestions, fetchParticipants, fetchViolations]);

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try { await deleteQuestion(questionId); fetchQuestions(); } catch (e) {}
  };

  const handleToggle = async () => {
    try { await toggleQuizActive(id, quiz.isActive); fetchQuiz(); } catch (e) {}
  };

 const submittedCount = participants.filter((p) => p.status === 'submitted').length;

  const s = {
    page: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' },
    container: { maxWidth: '1000px', margin: '0 auto', padding: '28px 20px' },
    tableWrap: { background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' },
    th: {
      padding: '12px 16px', fontSize: '11px', fontWeight: '700',
      textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888',
      borderBottom: '1px solid #f0f0f0', textAlign: 'left', background: '#fafafa',
    },
    td: { padding: '14px 16px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f5f5f5' },
  };

  if (!quiz) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #e0e0e0', borderTop: '3px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const tabs = [
    { key: 'questions', label: 'Questions', count: questions.length },
    { key: 'participants', label: 'Participants', count: participants.length },
    { key: 'violations', label: 'Violations', count: violations.length },
    { key: 'details', label: 'Details', count: null },
  ];

  const formatDateTime = (value) => {
    if (!value) return '-';
    // Firestore Timestamp
    if (value?.toDate) return new Date(value.toDate()).toLocaleString();
    // datetime-local string e.g. "2026-06-21T00:39"
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed.toLocaleString();
    return value;
  };

  const statusBadge = (status) => {
    const map = {
      submitted: { bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
      active: { bg: '#eff6ff', color: '#2563eb', border: '#93c5fd' },
      expired: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
    };
    const style = map[status] || map.expired;
    return (
      <span style={{
        background: style.bg, color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: '6px', padding: '3px 10px',
        fontSize: '12px', fontWeight: '600',
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            style={{ border: 'none', background: 'none', fontSize: '13px', color: '#888', cursor: 'pointer', padding: '0 0 12px 0', fontFamily: 'Inter, sans-serif' }}
          >
            ← Back
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0' }}>{quiz.title}</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', background: '#f0f0f0', color: '#333', letterSpacing: '1px' }}>
                  {quiz.quizCode}
                </span>
                <span style={{
                  fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px',
                  background: quiz.isActive ? '#f0fdf4' : '#fafafa',
                  color: quiz.isActive ? '#16a34a' : '#888',
                  border: `1px solid ${quiz.isActive ? '#86efac' : '#e0e0e0'}`,
                }}>
                  {quiz.isActive ? 'Active' : 'Inactive'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '500', padding: '4px 10px', borderRadius: '6px', background: '#fafafa', color: '#555', border: '1px solid #e0e0e0' }}>
                  {quiz.timeLimit} mins
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleToggle}
                style={{
                  padding: '9px 16px', border: '1px solid #e0e0e0', borderRadius: '8px',
                  background: '#fff', color: '#333', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                }}
              >
                {quiz.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => navigate(`/teacher/quiz/${id}/results`)}
                style={{
                  padding: '9px 16px', border: 'none', borderRadius: '8px',
                  background: '#000', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                }}
              >
                Results
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Participants', value: participants.length },
            { label: 'Submitted', value: submittedCount },
            { label: 'Total Violations', value: violations.length },
          ].map((stat) => (
            <div key={stat.label} style={{ flex: 1, minWidth: '120px', background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px 0', color: '#111' }}>{stat.value}</p>
              <p style={{ fontSize: '11px', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 16px', border: 'none', background: 'none',
                fontSize: '13px', fontWeight: activeTab === tab.key ? '700' : '500',
                color: activeTab === tab.key ? '#111' : '#888', cursor: 'pointer',
                borderBottom: activeTab === tab.key ? '2px solid #000' : '2px solid transparent',
                marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {tab.label}
              {tab.count !== null && (
                <span style={{
                  background: activeTab === tab.key ? '#000' : '#f0f0f0',
                  color: activeTab === tab.key ? '#fff' : '#888',
                  borderRadius: '999px', padding: '1px 7px', fontSize: '11px', fontWeight: '700',
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: '9px 16px', border: showForm ? '1px solid #e0e0e0' : 'none',
                borderRadius: '8px', background: showForm ? '#fff' : '#000',
                color: showForm ? '#333' : '#fff', fontSize: '13px',
                fontWeight: '600', cursor: 'pointer', marginBottom: '16px',
              }}
            >
              {showForm ? 'Cancel' : '+ Add Question'}
            </button>

            {showForm && (
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '20px', marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 16px 0' }}>Add New Question</p>
                <QuestionForm quizId={id} onSuccess={() => { setShowForm(false); fetchQuestions(); }} />
              </div>
            )}

            {questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
                <p style={{ fontSize: '14px', margin: 0 }}>No questions yet. Add your first question!</p>
              </div>
            ) : (
              questions.map((question, index) => (
                <div key={question.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '16px 20px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: '#f0f0f0', color: '#555' }}>
                        Q{index + 1}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', background: '#f0f0f0', color: '#555' }}>
                        {question.questionType}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', background: '#f0f0f0', color: '#555' }}>
                        {question.points} pts
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      style={{
                        padding: '5px 12px', border: '1px solid #fca5a5', borderRadius: '6px',
                        background: '#fef2f2', color: '#dc2626', fontSize: '12px', cursor: 'pointer', fontWeight: '500',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 10px 0', color: '#111' }}>
                    {question.questionText}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {question.choices?.map((choice) => (
                      <span
                        key={choice.id}
                        style={{
                          fontSize: '12px', fontWeight: '500', padding: '4px 10px', borderRadius: '6px',
                          background: choice.isCorrect ? '#f0fdf4' : '#fafafa',
                          color: choice.isCorrect ? '#16a34a' : '#555',
                          border: `1px solid ${choice.isCorrect ? '#86efac' : '#e0e0e0'}`,
                        }}
                      >
                        {choice.isCorrect ? '✓ ' : ''}{choice.choiceText}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>Auto-refreshes every 10 seconds</p>
              <button
                onClick={fetchParticipants}
                style={{ padding: '6px 14px', border: '1px solid #e0e0e0', borderRadius: '6px', background: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}
              >
                Refresh
              </button>
            </div>
            <div style={s.tableWrap}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['#', 'Name', 'Student ID', 'Section', 'Status', 'Violations', 'Started', 'Submitted'].map((h) => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {participants.length === 0 ? (
                    <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center', color: '#aaa', padding: '32px' }}>No participants yet</td></tr>
                  ) : (
                    participants.map((p, index) => (
                      <tr key={p.id}>
                        <td style={s.td}>{index + 1}</td>
                        <td style={{ ...s.td, fontWeight: '600' }}>{p.studentName}</td>
                        <td style={s.td}>{p.studentId}</td>
                        <td style={s.td}>{p.section || '-'}</td>
                        <td style={s.td}>{statusBadge(p.status)}</td>
                        <td style={s.td}>
                          <span style={{
                            fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px',
                            background: p.violationCount > 0 ? '#fef2f2' : '#fafafa',
                            color: p.violationCount > 0 ? '#dc2626' : '#888',
                            border: `1px solid ${p.violationCount > 0 ? '#fca5a5' : '#e0e0e0'}`,
                          }}>
                            {p.violationCount}
                          </span>
                        </td>
                        <td style={s.td}>{p.startedAt?.toDate ? new Date(p.startedAt.toDate()).toLocaleTimeString() : '-'}</td>
                        <td style={s.td}>{p.submittedAt?.toDate ? new Date(p.submittedAt.toDate()).toLocaleTimeString() : '-'}</td>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <button
                onClick={fetchViolations}
                style={{ padding: '6px 14px', border: '1px solid #e0e0e0', borderRadius: '6px', background: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}
              >
                Refresh
              </button>
            </div>
            <div style={s.tableWrap}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['#', 'Student', 'Violation Type', 'Description', 'Time'].map((h) => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {violations.length === 0 ? (
                    <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#aaa', padding: '32px' }}>No violations recorded</td></tr>
                  ) : (
                    violations.map((v, index) => (
                      <tr key={v.id}>
                        <td style={s.td}>{index + 1}</td>
                        <td style={{ ...s.td, fontWeight: '600' }}>{v.studentName || '-'}</td>
                        <td style={s.td}>
                          <span style={{
                            fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '6px',
                            background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5',
                          }}>
                            {v.violationType}
                          </span>
                        </td>
                        <td style={s.td}>{v.description}</td>
                        <td style={s.td}>{v.violatedAt?.toDate ? new Date(v.violatedAt.toDate()).toLocaleTimeString() : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            {[
              { label: 'Title', value: quiz.title || '-' },
              { label: 'Description', value: quiz.description || '-' },
              { label: 'Quiz Code', value: quiz.quizCode || '-' },
              { label: 'Status', value: quiz.isActive ? 'Active' : 'Inactive' },
              { label: 'Time Limit', value: `${quiz.timeLimit} mins` },
              { label: 'Max Violations', value: quiz.maxViolations },
              { label: 'Available From', value: formatDateTime(quiz.availableFrom) },
              { label: 'Available Until', value: formatDateTime(quiz.availableUntil) },
              { label: 'Randomize Questions', value: quiz.randomizeQuestions ? 'Yes' : 'No' },
              { label: 'Randomize Choices', value: quiz.randomizeChoices ? 'Yes' : 'No' },
              { label: 'Created At', value: formatDateTime(quiz.createdAt) },
              { label: 'Last Updated', value: formatDateTime(quiz.updatedAt) },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 20px',
                  borderBottom: i === arr.length - 1 ? 'none' : '1px solid #f0f0f0',
                }}
              >
                <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>{row.label}</span>
                <span style={{ fontSize: '13px', color: '#111', fontWeight: '600', textAlign: 'right' }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDetails;

