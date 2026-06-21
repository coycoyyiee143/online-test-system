import React from 'react';

const QuestionPalette = ({ questions, answers, currentIndex, onJump }) => {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #e0e0e0',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <p
        style={{
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#888',
          margin: '0 0 12px 0',
        }}
      >
        Questions
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {questions.map((q, index) => {
          const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
          const isCurrent = index === currentIndex;

          return (
            <button
              key={q.id}
              onClick={() => onJump(index)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: isCurrent ? '2px solid #000' : '1px solid #e0e0e0',
                background: isCurrent ? '#000' : isAnswered ? '#f0f0f0' : '#fff',
                color: isCurrent ? '#fff' : '#333',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#000' }} />
          <span style={{ fontSize: '11px', color: '#888' }}>Current</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f0f0f0', border: '1px solid #e0e0e0' }} />
          <span style={{ fontSize: '11px', color: '#888' }}>Answered</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#fff', border: '1px solid #e0e0e0' }} />
          <span style={{ fontSize: '11px', color: '#888' }}>Unanswered</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionPalette;