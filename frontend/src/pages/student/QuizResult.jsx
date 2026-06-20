import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizResult = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const data = localStorage.getItem('quiz_result');
      if (!data) {
        navigate('/');
        return;
      }
      try {
        setResult(JSON.parse(data));
        localStorage.removeItem('quiz_result');
      } catch (e) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="spinner-border text-primary" />
    </div>
  );

  if (!result) return null;

  const isPassed = result.remarks === 'Passed';

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow text-center p-5" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="mb-4">
          <div style={{ fontSize: '80px' }}>{isPassed ? '🎉' : '😔'}</div>
          <h2 className={`fw-bold ${isPassed ? 'text-success' : 'text-danger'}`}>
            {isPassed ? 'Congratulations!' : 'Better Luck Next Time!'}
          </h2>
          {result.studentName && (
            <p className="text-muted">{result.studentName}</p>
          )}
        </div>

        <div className={`alert ${isPassed ? 'alert-success' : 'alert-danger'} fs-4 fw-bold`}>
          {result.percentage}%
        </div>

        <div className="row text-center mb-4">
          <div className="col-4">
            <div className="fw-bold fs-5">{result.earnedPoints}</div>
            <small className="text-muted">Points Earned</small>
          </div>
          <div className="col-4">
            <div className="fw-bold fs-5">{result.totalPoints}</div>
            <small className="text-muted">Total Points</small>
          </div>
          <div className="col-4">
            <div className={`fw-bold fs-5 ${isPassed ? 'text-success' : 'text-danger'}`}>
              {result.remarks}
            </div>
            <small className="text-muted">Remarks</small>
          </div>
        </div>

        <button className="btn btn-primary w-100" onClick={() => navigate('/')}>
          Take Another Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizResult;