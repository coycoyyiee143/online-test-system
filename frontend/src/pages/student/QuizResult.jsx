import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizResult = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Slight delay para masiguro naka-save na sa localStorage
    const timer = setTimeout(() => {
      const data = localStorage.getItem('quiz_result');
      console.log('Raw quiz_result from storage:', data); // para ma-check

      if (!data) {
        console.log('No quiz result found, redirecting...');
        navigate('/');
        return;
      }

      try {
        const parsed = JSON.parse(data);
        console.log('Parsed result:', parsed);
        setResult(parsed);
        localStorage.removeItem('quiz_result');
      } catch (e) {
        console.error('Error parsing result:', e);
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
          <div style={{ fontSize: '80px' }}>
            {isPassed ? '🎉' : '😔'}
          </div>
          <h2 className={`fw-bold ${isPassed ? 'text-success' : 'text-danger'}`}>
            {isPassed ? 'Congratulations!' : 'Better Luck Next Time!'}
          </h2>
        </div>

        <div className={`alert ${isPassed ? 'alert-success' : 'alert-danger'} fs-4 fw-bold`}>
          {result.percentage}%
        </div>

        <div className="row text-center mb-4">
          <div className="col-4">
            <div className="fw-bold fs-5">{result.earned_points}</div>
            <small className="text-muted">Points Earned</small>
          </div>
          <div className="col-4">
            <div className="fw-bold fs-5">{result.total_points}</div>
            <small className="text-muted">Total Points</small>
          </div>
          <div className="col-4">
            <div className={`fw-bold fs-5 ${isPassed ? 'text-success' : 'text-danger'}`}>
              {result.remarks}
            </div>
            <small className="text-muted">Remarks</small>
          </div>
        </div>

        <button
          className="btn btn-primary w-100"
          onClick={() => navigate('/')}
        >
          Take Another Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizResult;