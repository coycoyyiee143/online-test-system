import React from 'react';

const QuestionCard = ({ question, answer, onAnswer, index, total }) => {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#888' }}>
          Question {index + 1} of {total}
        </span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: '700',
            background: '#f0f0f0',
            color: '#333',
            padding: '3px 10px',
            borderRadius: '999px',
          }}
        >
          {question.points} {question.points > 1 ? 'pts' : 'pt'}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 20px' }}>
        {question.imagePath && (
          <img
            src={question.imagePath}
            alt="Question"
            style={{
              width: '100%',
              borderRadius: '8px',
              marginBottom: '16px',
              objectFit: 'cover',
            }}
          />
        )}

        <p
          style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#111',
            lineHeight: '1.6',
            marginBottom: '24px',
          }}
        >
          {question.questionText}
        </p>

        {question.questionType === 'essay' ? (
          <textarea
            rows={5}
            placeholder="Write your answer here..."
            value={answer || ''}
            onChange={(e) => onAnswer(question.id, null, e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
              boxSizing: 'border-box',
              lineHeight: '1.6',
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {question.choices.map((choice) => {
              const isSelected = answer === choice.id;
              return (
                <label
                  key={choice.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    border: isSelected ? '2px solid #000' : '1px solid #e0e0e0',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected ? '#f9f9f9' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  {/* Custom Radio */}
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: isSelected ? '5px solid #000' : '2px solid #ccc',
                      flexShrink: 0,
                      transition: 'all 0.15s',
                    }}
                  />
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    checked={isSelected}
                    onChange={() => onAnswer(question.id, choice.id, null)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: '14px', color: '#222', fontWeight: isSelected ? '600' : '400' }}>
                    {choice.choiceText}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;