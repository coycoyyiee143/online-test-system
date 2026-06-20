import React from 'react';

const QuestionCard = ({ question, answer, onAnswer, index, total }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span className="fw-bold">Question {index + 1} of {total}</span>
        <span className="badge bg-primary">{question.points} pt{question.points > 1 ? 's' : ''}</span>
      </div>
      <div className="card-body">
        {question.imagePath && (
          <img
            src={question.imagePath}
            alt="Question"
            className="img-fluid mb-3 rounded"
          />
        )}
        <p className="fs-5 mb-4">{question.questionText}</p>

        {question.questionType === 'essay' ? (
          <textarea
            className="form-control"
            rows={5}
            placeholder="Write your answer here..."
            value={answer || ''}
            onChange={(e) => onAnswer(question.id, null, e.target.value)}
          />
        ) : (
          <div className="d-flex flex-column gap-2">
            {question.choices.map((choice) => (
              <label
                key={choice.id}
                className={`d-flex align-items-center p-3 rounded border ${
                  answer === choice.id ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  className="me-3"
                  checked={answer === choice.id}
                  onChange={() => onAnswer(question.id, choice.id, null)}
                />
                {choice.choiceText}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;