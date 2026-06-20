import React, { useState } from 'react';
import api from '../../utils/api';

const QuestionForm = ({ quizId, onSuccess, editData = null }) => {
  const [questionText, setQuestionText] = useState(editData?.question_text || '');
  const [questionType, setQuestionType] = useState(editData?.question_type || 'multiple_choice');
  const [points, setPoints] = useState(editData?.points || 1);
  const [choices, setChoices] = useState(
    editData?.choices || [
      { choice_text: '', is_correct: false },
      { choice_text: '', is_correct: false },
      { choice_text: '', is_correct: false },
      { choice_text: '', is_correct: false },
    ]
  );
  const [loading, setLoading] = useState(false);

  const handleChoiceChange = (index, field, value) => {
    const updated = [...choices];
    if (field === 'is_correct') {
      updated.forEach((c, i) => (c.is_correct = i === index));
    } else {
      updated[index][field] = value;
    }
    setChoices(updated);
  };

  const handleTrueFalse = () => {
    setChoices([
      { choice_text: 'True', is_correct: true },
      { choice_text: 'False', is_correct: false },
    ]);
  };

  const handleTypeChange = (type) => {
    setQuestionType(type);
    if (type === 'true_false') handleTrueFalse();
    if (type === 'multiple_choice') {
      setChoices([
        { choice_text: '', is_correct: false },
        { choice_text: '', is_correct: false },
        { choice_text: '', is_correct: false },
        { choice_text: '', is_correct: false },
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        question_text: questionText,
        question_type: questionType,
        points,
        choices: questionType !== 'essay' ? choices : [],
      };

      if (editData) {
        await api.put(`/quizzes/${quizId}/questions/${editData.id}`, payload);
      } else {
        await api.post(`/quizzes/${quizId}/questions`, payload);
      }

      onSuccess();
    } catch (e) {
      alert('Error saving question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label fw-bold">Question Type</label>
        <select
          className="form-select"
          value={questionType}
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          <option value="multiple_choice">Multiple Choice</option>
          <option value="true_false">True or False</option>
          <option value="essay">Essay</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">Question</label>
        <textarea
          className="form-control"
          rows={3}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">Points</label>
        <input
          type="number"
          className="form-control"
          min={1}
          value={points}
          onChange={(e) => setPoints(parseInt(e.target.value))}
          required
        />
      </div>

      {questionType !== 'essay' && (
        <div className="mb-3">
          <label className="form-label fw-bold">Choices</label>
          {choices.map((choice, index) => (
            <div key={index} className="input-group mb-2">
              <div className="input-group-text">
                <input
                  type="radio"
                  name="correct_choice"
                  checked={choice.is_correct}
                  onChange={() => handleChoiceChange(index, 'is_correct', true)}
                />
              </div>
              <input
                type="text"
                className="form-control"
                placeholder={`Choice ${index + 1}`}
                value={choice.choice_text}
                onChange={(e) => handleChoiceChange(index, 'choice_text', e.target.value)}
                disabled={questionType === 'true_false'}
                required
              />
            </div>
          ))}
          <small className="text-muted">Select the radio button for the correct answer</small>
        </div>
      )}

      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
        {loading ? 'Saving...' : editData ? 'Update Question' : 'Add Question'}
      </button>
    </form>
  );
};

export default QuestionForm;