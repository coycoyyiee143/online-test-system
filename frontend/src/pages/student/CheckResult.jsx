import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getResultByCodeAndStudentId } from '../../services/resultLookupService';

const CheckResult = () => {
  const [quizCode, setQuizCode] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

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

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setData(null);
    setLoading(true);

    try {
      const res = await getResultByCodeAndStudentId(quizCode, studentId);

      if (res.status === 'not_found') {
        setError('No quiz found with that code.');
      } else if (res.status === 'no_submission') {
        setError("We couldn't find a submission with that Student ID for this quiz.");
      } else if (res.status === 'review_disabled') {
        setError('Your teacher has not enabled answer review for this quiz yet.');
      } else {
        setData(res);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError('');
    setQuizCode('');
    setStudentId('');
  };

  // ---------- Search Form View ----------
  if (!data) {
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
          padding: '36px 32px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>Check My Result</h2>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '4px', marginBottom: 0 }}>
              Enter the quiz code and your Student ID to view your result
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px',
              padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSearch}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Quiz Code</label>
              <input
                type="text"
                placeholder="Enter quiz code"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                style={{
                  ...inputStyle, textAlign: 'center', fontSize: '20px',
                  fontWeight: '700', letterSpacing: '6px',
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Student ID</label>
              <input
                type="text"
                placeholder="Enter your student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', background: loading ? '#ccc' : '#000',
                color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px',
                fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.3px',
              }}
            >
              {loading ? 'Searching...' : 'View Result'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
              <Link to="/" style={{ color: '#000', fontWeight: '600', textDecoration: 'none' }}>
                ← Back to Join Quiz
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Result Detail View ----------
  const { quiz, result, questions, answers } = data;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '28px 20px' }}>

        <button
          onClick={handleReset}
          style={{ border: 'none', background: 'none', fontSize: '13px', color: '#888', cursor: 'pointer', padding: '0 0 16px 0', fontFamily: 'Inter, sans-serif' }}
        >
          ← Check another result
        </button>

        {/* Summary Card */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '20px 24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>
                {quiz.title}
              </h4>
              <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                {result.studentName} — {result.section || 'No section'}
              </p>
            </div>
            <span style={{
              fontSize: '13px', fontWeight: '700', padding: '6px 14px', borderRadius: '8px',
              background: result.remarks === 'Passed' ? '#f0fdf4' : '#fef2f2',
              color: result.remarks === 'Passed' ? '#16a34a' : '#dc2626',
              border: `1px solid ${result.remarks === 'Passed' ? '#86efac' : '#fca5a5'}`,
            }}>
              {result.remarks}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Score', value: `${result.earnedPoints}/${result.totalPoints}` },
              { label: 'Percentage', value: `${result.percentage}%` },
              { label: 'Violations', value: result.totalViolations },
            ].map((stat) => (
              <div key={stat.label} style={{ flex: 1, minWidth: '100px', background: '#fafafa', borderRadius: '10px', padding: '12px 16px', border: '1px solid #f0f0f0', textAlign: 'center' }}>
                <p style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 2px 0', color: '#111' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '11px', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Questions and Answers */}
        <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888', marginBottom: '12px' }}>
          Answers ({questions.length} Questions)
        </p>

        {questions.map((question, index) => {
          const studentAnswer = answers.find((a) => a.questionId === question.id);
          const isEssay = question.questionType === 'essay';
          const selectedChoice = question.choices?.find((c) => c.id === studentAnswer?.choiceId);
          const isCorrect = selectedChoice?.isCorrect;
          const isUnanswered = !studentAnswer || (!studentAnswer.choiceId && !studentAnswer.essayAnswer);

          return (
            <div
              key={question.id}
              style={{
                background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0',
                marginBottom: '12px', overflow: 'hidden',
              }}
            >
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid #f0f0f0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: '#f0f0f0', color: '#555' }}>
                    Q{index + 1}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', background: '#f0f0f0', color: '#555' }}>
                    {question.points} pts
                  </span>
                </div>
                {!isEssay && (
                  <span style={{
                    fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '6px',
                    background: isUnanswered ? '#fafafa' : isCorrect ? '#f0fdf4' : '#fef2f2',
                    color: isUnanswered ? '#888' : isCorrect ? '#16a34a' : '#dc2626',
                    border: `1px solid ${isUnanswered ? '#e0e0e0' : isCorrect ? '#86efac' : '#fca5a5'}`,
                  }}>
                    {isUnanswered ? 'No Answer' : isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>

              <div style={{ padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                  {question.questionText}
                </p>

                {isEssay ? (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888', margin: '0 0 8px 0' }}>
                      Your Answer
                    </p>
                    <div style={{
                      background: '#fafafa', borderRadius: '8px', padding: '12px 14px',
                      border: '1px solid #f0f0f0', fontSize: '13px', color: '#333', lineHeight: '1.6',
                    }}>
                      {studentAnswer?.essayAnswer || (
                        <span style={{ color: '#aaa', fontStyle: 'italic' }}>No answer provided</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {question.choices?.map((choice) => {
                      const isSelected = studentAnswer?.choiceId === choice.id;
                      const isCorrectChoice = choice.isCorrect;

                      let bg = '#fafafa';
                      let border = '#f0f0f0';
                      let color = '#555';
                      let labelColor = '#555';

                      if (isCorrectChoice) {
                        bg = '#f0fdf4'; border = '#86efac'; color = '#16a34a'; labelColor = '#16a34a';
                      }
                      if (isSelected && !isCorrectChoice) {
                        bg = '#fef2f2'; border = '#fca5a5'; color = '#dc2626'; labelColor = '#dc2626';
                      }

                      return (
                        <div
                          key={choice.id}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', borderRadius: '8px',
                            border: `1px solid ${border}`, background: bg,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                              border: isSelected ? `5px solid ${color}` : `2px solid #ccc`,
                            }} />
                            <span style={{ fontSize: '13px', color: labelColor, fontWeight: isSelected || isCorrectChoice ? '600' : '400' }}>
                              {choice.choiceText}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {isSelected && (
                              <span style={{
                                fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px',
                                background: isCorrectChoice ? '#dcfce7' : '#fee2e2',
                                color: isCorrectChoice ? '#16a34a' : '#dc2626',
                              }}>
                                You
                              </span>
                            )}
                            {isCorrectChoice && (
                              <span style={{
                                fontSize: '11px', fontWeight: '700', padding: '2px 8px',
                                borderRadius: '999px', background: '#dcfce7', color: '#16a34a',
                              }}>
                                Correct
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckResult;