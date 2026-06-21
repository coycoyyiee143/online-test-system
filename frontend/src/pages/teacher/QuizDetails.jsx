import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, toggleQuizActive, getQuizEffectiveStatus } from '../../services/quizService';
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
  const [editData, setEditData] = useState(null);


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
  const effectiveStatus = getQuizEffectiveStatus(quiz);
  const isExpired = effectiveStatus === 'expired';
  const isLocked = submittedCount > 0;

  const participantMap = participants.reduce((acc, participant) => {
    acc[participant.id] = participant;
    return acc;
  }, {});

  const formatDateTime = (value) => {
    if (!value) return '-';
    if (value?.toDate) return new Date(value.toDate()).toLocaleString();
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


  const effectiveStatusBadge = () => {
    const map = {
      active: { bg: '#f0fdf4', color: '#16a34a', border: '#86efac', label: 'Active' },
      expired: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5', label: 'Expired' },
      upcoming: { bg: '#eff6ff', color: '#2563eb', border: '#93c5fd', label: 'Upcoming' },
      inactive: { bg: '#fafafa', color: '#888', border: '#e0e0e0', label: 'Inactive' },
    };
    const style = map[effectiveStatus] || map.inactive;
    return (
      <span style={{
        fontSize: '12px', fontWeight: '600', padding: '4px 10px',
        borderRadius: '6px', background: style.bg,
        color: style.color, border: `1px solid ${style.border}`,
      }}>
        {style.label}
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
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', background: '#f0f0f0', color: '#333', letterSpacing: '1px' }}>
                  {quiz.quizCode}
                </span>
                {effectiveStatusBadge()}
                <span style={{ fontSize: '12px', fontWeight: '500', padding: '4px 10px', borderRadius: '6px', background: '#fafafa', color: '#555', border: '1px solid #e0e0e0' }}>
                  {quiz.timeLimit} mins
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(`/teacher/quiz/${id}/edit`)}
                style={{
                  padding: '9px 16px', border: '1px solid #e0e0e0', borderRadius: '8px',
                  background: '#fff', color: '#333', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                }}
              >
                Edit
              </button>
              {effectiveStatus !== 'expired' && (
                <button
                  onClick={handleToggle}
                  style={{
                    padding: '9px 16px', border: '1px solid #e0e0e0', borderRadius: '8px',
                    background: '#fff', color: '#333', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                  }}
                >
                  {quiz.isActive ? 'Deactivate' : 'Activate'}
                </button>
              )}
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
            { label: 'Questions', value: questions.length },
          ].map((stat) => (
            <div key={stat.label} style={{
              flex: 1, minWidth: '100px', background: '#fff',
              borderRadius: '12px', padding: '16px', border: '1px solid #e0e0e0', textAlign: 'center',
            }}>
              <p style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px 0', color: '#111' }}>{stat.value}</p>
              <p style={{ fontSize: '11px', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid #e0e0e0', overflowX: 'auto' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 16px', border: 'none', background: 'none', whiteSpace: 'nowrap',
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
    {/* Expired Notice */}
    {isExpired && (
      <div style={{
        background: '#fef2f2', border: '1px solid #fca5a5',
        borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <p style={{ fontSize: '13px', color: '#991b1b', margin: 0, fontWeight: '500' }}>
          This quiz has expired. All question management is disabled.
        </p>
      </div>
    )}

    {/* Locked Notice - may submitted pero hindi expired */}
    {!isExpired && isLocked && (
      <div style={{
        background: '#fffbeb', border: '1px solid #fcd34d',
        borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <p style={{ fontSize: '13px', color: '#92400e', margin: 0, fontWeight: '500' }}>
          <strong>{submittedCount} student{submittedCount > 1 ? 's have' : ' has'}</strong> already submitted. Adding and deleting questions is disabled to maintain accuracy. You can still edit existing questions.
        </p>
      </div>
    )}

    {/* Question Actions */}
    {!isExpired && !isLocked && (
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setShowForm(!showForm); setEditData(null); }}
          style={{
            padding: '9px 16px',
            border: showForm && !editData ? '1px solid #e0e0e0' : 'none',
            borderRadius: '8px',
            background: showForm && !editData ? '#fff' : '#000',
            color: showForm && !editData ? '#333' : '#fff',
            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
          }}
        >
          {showForm && !editData ? 'Cancel' : '+ Add Question'}
        </button>
        <button
          onClick={() => alert('Upload Quiz feature coming soon!')}
          style={{
            padding: '9px 16px', border: '1px solid #e0e0e0', borderRadius: '8px',
            background: '#fff', color: '#333', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload Quiz
        </button>
      </div>
    )}

    {/* Add/Edit Form */}
    {showForm && !isExpired && (
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>
            {editData ? 'Edit Question' : 'Add New Question'}
          </p>
          <button
            onClick={() => { setShowForm(false); setEditData(null); }}
            style={{ border: 'none', background: 'none', fontSize: '13px', color: '#888', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            Cancel
          </button>
        </div>
        <QuestionForm
          quizId={id}
          editData={editData}
          onSuccess={() => { setShowForm(false); setEditData(null); fetchQuestions(); }}
        />
      </div>
    )}

    {/* Questions List */}
    {questions.length === 0 ? (
      <div style={{
        textAlign: 'center', padding: '48px 0', color: '#aaa',
        background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0',
      }}>
        <p style={{ fontSize: '14px', margin: '0 0 4px 0', fontWeight: '600', color: '#555' }}>No questions yet</p>
        <p style={{ fontSize: '13px', margin: 0, color: '#aaa' }}>Add questions manually or upload a file</p>
      </div>
    ) : (
      questions.map((question, index) => (
        <div key={question.id} style={{
          background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0',
          padding: '16px 20px', marginBottom: '10px',
        }}>
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

            <div style={{ display: 'flex', gap: '6px' }}>
              {/* Edit — available hanggang hindi expired */}
              {!isExpired && (
                <button
                  onClick={() => {
                    setEditData(question);
                    setShowForm(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    padding: '5px 12px', border: '1px solid #e0e0e0', borderRadius: '6px',
                    background: '#fff', color: '#333', fontSize: '12px', cursor: 'pointer', fontWeight: '500',
                  }}
                >
                  Edit
                </button>
              )}

              {/* Delete — disabled if may submitted or expired */}
              {!isExpired && !isLocked && (
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  style={{
                    padding: '5px 12px', border: '1px solid #fca5a5', borderRadius: '6px',
                    background: '#fef2f2', color: '#dc2626', fontSize: '12px', cursor: 'pointer', fontWeight: '500',
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 10px 0', color: '#111', lineHeight: '1.5' }}>
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
                    {['#', 'Name', 'Student ID', 'Section', 'Status', 'Started', 'Submitted'].map((h) => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {participants.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...s.td, textAlign: 'center', color: '#aaa', padding: '32px' }}>No participants yet</td></tr>
                  ) : (
                    participants.map((p, index) => (
                      <tr key={p.id}>
                        <td style={s.td}>{index + 1}</td>
                        <td style={{ ...s.td, fontWeight: '600' }}>{p.studentName}</td>
                        <td style={s.td}>{p.studentId}</td>
                        <td style={s.td}>{p.section || '-'}</td>
                        <td style={s.td}>{statusBadge(p.status)}</td>
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
                    {['#', 'Student', 'Student ID', 'Violation', 'Description', 'Time'].map((h) => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {violations.length === 0 ? (
                    <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#aaa', padding: '32px' }}>No violations recorded</td></tr>
                  ) : (
                    violations.map((v, index) => (
                      <tr key={v.id}>
                        <td style={s.td}>{index + 1}</td>
                        <td style={{ ...s.td, fontWeight: '600' }}>
                          {participantMap[v.sessionId]?.studentName || 'Unknown'}
                        </td>
                        <td style={s.td}>
                          {participantMap[v.sessionId]?.studentId || '-'}
                        </td>
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
              { label: 'Status', value: effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1) },
              { label: 'Manually Activated', value: quiz.isActive ? 'Yes' : 'No' },
              { label: 'Time Limit', value: `${quiz.timeLimit} mins` },
              { label: 'Max Violations', value: quiz.maxViolations },
              { label: 'Allow Answer Review', value: quiz.allowReviewAnswers ? 'Yes' : 'No' },
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
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '13px', color: '#888', fontWeight: '500', flexShrink: 0 }}>
                  {row.label}
                </span>
                <span style={{ fontSize: '13px', color: '#111', fontWeight: '600', textAlign: 'right' }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDetails;