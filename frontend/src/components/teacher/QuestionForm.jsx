import React, { useState } from 'react';
import { addQuestion, updateQuestion } from '../../services/questionService';

const QuestionForm = ({ quizId, onSuccess, editData = null }) => {
  const [questionText, setQuestionText] = useState(editData?.questionText || '');
  const [questionType, setQuestionType] = useState(editData?.questionType || 'multiple_choice');
  const [points, setPoints] = useState(editData?.points || 1);
  const [choices, setChoices] = useState(
    editData?.choices || [
      { id: '1', choiceText: '', isCorrect: false },
      { id: '2', choiceText: '', isCorrect: false },
      { id: '3', choiceText: '', isCorrect: false },
      { id: '4', choiceText: '', isCorrect: false },
    ]
  );
  const [loading, setLoading] = useState(false);

  const handleChoiceChange = (index, field, value) => {
    const updated = [...choices];
    if (field === 'isCorrect') {
      updated.forEach((c) => (c.isCorrect = false));
      updated[index].isCorrect = true;
    } else {
      updated[index][field] = value;
    }
    setChoices(updated);
  };

  const handleTypeChange = (type) => {
    setQuestionType(type);
    if (type === 'true_false') {
      setChoices([
        { id: '1', choiceText: 'True', isCorrect: true },
        { id: '2', choiceText: 'False', isCorrect: false },
      ]);
    } else if (type === 'multiple_choice') {
      setChoices([
        { id: '1', choiceText: '', isCorrect: false },
        { id: '2', choiceText: '', isCorrect: false },
        { id: '3', choiceText: '', isCorrect: false },
        { id: '4', choiceText: '', isCorrect: false },
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        questionText,
        questionType,
        points: parseInt(points),
        choices: questionType !== 'essay' ? choices : [],
      };

      if (editData) {
        await updateQuestion(editData.id, payload);
      } else {
        await addQuestion(quizId, payload);
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
          onChange={(e) => setPoints(e.target.value)}
          required
        />
      </div>

      {questionType !== 'essay' && (
        <div className="mb-3">
          <label className="form-label fw-bold">Choices</label>
          {choices.map((choice, index) => (
            <div key={choice.id} className="input-group mb-2">
              <div className="input-group-text">
                <input
                  type="radio"
                  name="correct_choice"
                  checked={choice.isCorrect}
                  onChange={() => handleChoiceChange(index, 'isCorrect', true)}
                />
              </div>
              <input
                type="text"
                className="form-control"
                placeholder={`Choice ${index + 1}`}
                value={choice.choiceText}
                onChange={(e) => handleChoiceChange(index, 'choiceText', e.target.value)}
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