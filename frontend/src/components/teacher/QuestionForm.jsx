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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  const saveQuestion = async () => {
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
      setShowConfirmModal(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // kapag edit lang, mag-confirm muna
    if (editData) {
      setShowConfirmModal(true);
      return;
    }

    saveQuestion();
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
    <>
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

      {/* Confirmation Modal — only shown when editing an existing question */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
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
              maxWidth: '420px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              fontFamily: 'Inter, sans-serif',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px 24px 0 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h5 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#111' }}>
                  Update this question?
                </h5>
                <p style={{ fontSize: '13px', color: '#888', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                  This question already has student submissions. Saving changes will do the following:
                </p>
              </div>
            </div>

            {/* Modal Body — what will happen */}
            <div style={{ padding: '16px 24px 0 24px' }}>
              <div style={{
                background: '#fafafa',
                border: '1px solid #f0f0f0',
                borderRadius: '10px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                {[
                  'The question text, choices, or correct answer will be updated immediately.',
                  'Every student who already submitted this quiz will have their score recalculated based on the new answer key.',
                  'Scores, percentages, and pass/fail remarks may change for past submissions.',
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#000',
                      marginTop: '6px',
                      flexShrink: 0,
                    }} />
                    <p style={{ fontSize: '13px', color: '#333', margin: 0, lineHeight: '1.5' }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '20px 24px 24px 24px', display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  background: '#fff',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveQuestion}
                disabled={loading}
                style={{
                  flex: 1,
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
                {loading ? 'Updating...' : 'Yes, Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionForm;