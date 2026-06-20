import React from 'react';

const QuestionPalette = ({ questions, answers, currentIndex, onJump }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white fw-bold">
        Question Palette
      </div>
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2">
          {questions.map((q, index) => {
            const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
            const isCurrent = index === currentIndex;
            return (
              <button
                key={q.id}
                className={`btn btn-sm ${
                  isCurrent
                    ? 'btn-primary'
                    : isAnswered
                    ? 'btn-success'
                    : 'btn-outline-secondary'
                }`}
                style={{ width: '40px', height: '40px' }}
                onClick={() => onJump(index)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <div className="mt-3 small">
          <span className="badge bg-success me-1">●</span> Answered
          <span className="badge bg-secondary ms-2 me-1">●</span> Unanswered
          <span className="badge bg-primary ms-2 me-1">●</span> Current
        </div>
      </div>
    </div>
  );
};

export default QuestionPalette;