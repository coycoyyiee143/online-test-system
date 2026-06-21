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

  const inputStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
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
    <form onSubmit={handleSubmit} style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Question Type */}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Question Type</label>
        <select
          value={questionType}
          onChange={(e) => handleTypeChange(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="multiple_choice">Multiple Choice</option>
          <option value="true_false">True or False</option>
          <option value="essay">Essay</option>
        </select>
      </div>

      {/* Question Text */}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Question</label>
        <textarea
          rows={3}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question here..."
          style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
          required
        />
      </div>

      {/* Points */}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Points</label>
        <input
          type="number"
          min={1}
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          style={{ ...inputStyle, maxWidth: '120px' }}
          required
        />
      </div>

      {/* Choices */}
      {questionType !== 'essay' && (
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Choices</label>
          <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 10px 0' }}>
            Select the radio button to mark the correct answer
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {choices.map((choice, index) => (
              <label
                key={choice.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  border: choice.isCorrect ? '2px solid #000' : '1px solid #e0e0e0',
                  borderRadius: '8px',
                  background: choice.isCorrect ? '#f9f9f9' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {/* Custom Radio */}
                <div
                  onClick={() => handleChoiceChange(index, 'isCorrect', true)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: choice.isCorrect ? '5px solid #000' : '2px solid #ccc',
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                />
                <input
                  type="text"
                  placeholder={`Choice ${index + 1}`}
                  value={choice.choiceText}
                  onChange={(e) => handleChoiceChange(index, 'choiceText', e.target.value)}
                  disabled={questionType === 'true_false'}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    background: 'transparent',
                    fontFamily: 'Inter, sans-serif',
                    color: '#222',
                  }}
                  required
                />
                {choice.isCorrect && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#16a34a',
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '999px',
                    padding: '2px 8px',
                    flexShrink: 0,
                  }}>
                    Correct
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          border: 'none',
          borderRadius: '8px',
          background: loading ? '#ccc' : '#000',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Saving...' : editData ? 'Update Question' : 'Add Question'}
      </button>
    </form>
  );
};

export default QuestionForm;