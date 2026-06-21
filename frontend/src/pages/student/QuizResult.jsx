import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizResult = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const data = localStorage.getItem('quiz_result');
      if (!data) { navigate('/'); return; }
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid #e0e0e0',
        borderTop: '3px solid #000',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!result) return null;

  const isPassed = result.remarks === 'Passed';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '40px 32px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}>

        {/* Top accent bar */}
        <div style={{
          height: '4px',
          background: isPassed ? '#16a34a' : '#dc2626',
          borderRadius: '999px',
          marginBottom: '32px',
        }} />

        {/* Status */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: isPassed ? '#f0fdf4' : '#fef2f2',
          fontSize: '28px',
          marginBottom: '16px',
        }}>
          {isPassed ? '✓' : '✗'}
        </div>

        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          margin: '0 0 6px 0',
          color: '#111',
        }}>
          {isPassed ? 'Quiz Passed' : 'Quiz Failed'}
        </h3>

        {result.studentName && (
          <p style={{ fontSize: '13px', color: '#888', margin: '0 0 24px 0' }}>
            {result.studentName}
          </p>
        )}

        {result.quizTitle && (
          <p style={{ fontSize: '13px', color: '#aaa', margin: '-16px 0 24px 0' }}>
            {result.quizTitle}
          </p>
        )}

        {/* Score Circle */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: `6px solid ${isPassed ? '#16a34a' : '#dc2626'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 28px',
          background: isPassed ? '#f0fdf4' : '#fef2f2',
        }}>
          <span style={{
            fontSize: '28px',
            fontWeight: '800',
            color: isPassed ? '#16a34a' : '#dc2626',
          }}>
            {result.percentage}%
          </span>
          <span style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
            Score
          </span>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '28px',
        }}>
          {[
            { label: 'Earned', value: result.earnedPoints },
            { label: 'Total', value: result.totalPoints },
            { label: 'Remarks', value: result.remarks, colored: true },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                background: '#fafafa',
                borderRadius: '10px',
                padding: '14px 8px',
                border: '1px solid #f0f0f0',
              }}
            >
              <p style={{
                fontSize: '16px',
                fontWeight: '700',
                margin: '0 0 4px 0',
                color: stat.colored ? (isPassed ? '#16a34a' : '#dc2626') : '#111',
              }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '11px', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Remarks Message */}
        <div style={{
          background: isPassed ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${isPassed ? '#86efac' : '#fca5a5'}`,
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '24px',
          fontSize: '13px',
          color: isPassed ? '#16a34a' : '#dc2626',
          fontWeight: '500',
        }}>
          {isPassed
            ? 'Great job! You have successfully passed this quiz.'
            : 'You did not meet the passing score. Keep practicing!'}
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            padding: '13px',
            border: 'none',
            borderRadius: '8px',
            background: '#000',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Take Another Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizResult;