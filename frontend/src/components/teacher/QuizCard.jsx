import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toggleQuizActive, deleteQuiz, getQuizEffectiveStatus } from '../../services/quizService';

const QuizCard = ({ quiz, onRefresh }) => {
  const navigate = useNavigate();
  const status = getQuizEffectiveStatus(quiz);

  const statusStyle = {
    active: { bg: '#f0fdf4', color: '#16a34a', border: '#86efac', label: 'Active' },
    expired: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5', label: 'Expired' },
    upcoming: { bg: '#eff6ff', color: '#2563eb', border: '#93c5fd', label: 'Upcoming' },
    inactive: { bg: '#fafafa', color: '#888', border: '#e0e0e0', label: 'Inactive' },
  }[status];

  const handleToggle = async () => {
    try {
      await toggleQuizActive(quiz.id, quiz.isActive);
      onRefresh();
    } catch (e) {
      alert('Error toggling quiz status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await deleteQuiz(quiz.id);
      onRefresh();
    } catch (e) {
      alert('Error deleting quiz');
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        padding: '20px',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'box-shadow 0.15s',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <h5
          style={{
            fontSize: '15px',
            fontWeight: '700',
            margin: 0,
            color: '#111',
            lineHeight: '1.4',
          }}
        >
          {quiz.title}
        </h5>
        <span
          style={{
            fontSize: '11px',
            fontWeight: '600',
            padding: '3px 10px',
            borderRadius: '999px',
            flexShrink: 0,
            background: statusStyle.bg,
            color: statusStyle.color,
            border: `1px solid ${statusStyle.border}`,
          }}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: '13px', color: '#888', margin: 0, lineHeight: '1.5' }}>
        {quiz.description || 'No description'}
      </p>

      {/* Meta */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '12px',
          fontWeight: '700',
          padding: '4px 10px',
          borderRadius: '6px',
          background: '#f0f0f0',
          color: '#333',
          letterSpacing: '1px',
        }}>
          {quiz.quizCode}
        </span>
        <span style={{
          fontSize: '12px',
          fontWeight: '500',
          padding: '4px 10px',
          borderRadius: '6px',
          background: '#fafafa',
          color: '#555',
          border: '1px solid #e0e0e0',
        }}>
          {quiz.timeLimit} mins
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: '#f0f0f0' }} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => navigate(`/teacher/quiz/${quiz.id}`)}
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            borderRadius: '7px',
            background: '#000',
            color: '#fff',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Manage
        </button>
        {status === 'expired' ? (
          <span
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '7px',
              background: '#fafafa',
              color: '#aaa',
              fontSize: '12px',
              fontWeight: '500',
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            Quiz ended
          </span>
        ) : (
          <button
            onClick={handleToggle}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #e0e0e0',
              borderRadius: '7px',
              background: '#fff',
              color: '#333',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            {quiz.isActive ? 'Deactivate' : 'Activate'}
          </button>
        )}
        <button
          onClick={handleDelete}
          style={{
            padding: '8px 12px',
            border: '1px solid #fca5a5',
            borderRadius: '7px',
            background: '#fef2f2',
            color: '#dc2626',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default QuizCard;