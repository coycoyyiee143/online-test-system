import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const QuizCard = ({ quiz, onRefresh }) => {
  const navigate = useNavigate();

  const handleToggle = async () => {
    try {
      await api.patch(`/quizzes/${quiz.id}/toggle`);
      onRefresh();
    } catch (e) {
      alert('Error toggling quiz status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await api.delete(`/quizzes/${quiz.id}`);
      onRefresh();
    } catch (e) {
      alert('Error deleting quiz');
    }
  };

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title mb-0">{quiz.title}</h5>
          <span className={`badge ${quiz.is_active ? 'bg-success' : 'bg-secondary'}`}>
            {quiz.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="text-muted small mb-2">{quiz.description || 'No description'}</p>
        <div className="mb-3">
          <span className="badge bg-primary me-1">Code: {quiz.quiz_code}</span>
          <span className="badge bg-info me-1">{quiz.questions_count} Questions</span>
          <span className="badge bg-warning text-dark">{quiz.time_limit} mins</span>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => navigate(`/teacher/quiz/${quiz.id}`)}
          >
            Manage
          </button>
          <button
            className={`btn btn-sm ${quiz.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}
            onClick={handleToggle}
          >
            {quiz.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;