import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getResultDetail,
  getResultsByQuiz,
  recalculateResultsForQuiz,
} from '../../services/resultService';
import { getQuestionsByQuiz } from '../../services/questionService';
import { gradeEssayAnswer } from '../../services/answerService';
import Navbar from '../../components/teacher/Navbar';

const ResultDetail = () => {
  const { quizId, sessionId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gradeInputs, setGradeInputs] = useState({});
  const [savingId, setSavingId] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [questionsData, answersData, resultsData] = await Promise.all([
        getQuestionsByQuiz(quizId),
        getResultDetail(sessionId),
        getResultsByQuiz(quizId),
      ]);

      setQuestions(questionsData);
      setAnswers(answersData);

      // Find this student's result
      const studentResult = resultsData.results.find(
        (r) => r.sessionId === sessionId
      );
      setResult(studentResult);

      // Seed grade inputs from existing saved grades
      const seeded = {};
      answersData.forEach((a) => {
        if (typeof a.awardedPoints === 'number') {
          seeded[a.id] = a.awardedPoints;
        }
      });
      setGradeInputs((prev) => ({ ...seeded, ...prev }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, sessionId]);

  const handleSaveGrade = async (answer, maxPoints) => {
    const rawValue = gradeInputs[answer.id];
    const awardedPoints = parseFloat(rawValue);

    if (isNaN(awardedPoints)) {
      alert('Please enter a valid number of points.');
      return;
    }

    setSavingId(answer.id);
    try {
      await gradeEssayAnswer(answer.id, awardedPoints, maxPoints);

      // Recalculate this quiz's results so the score reflects the new grade
      const updatedQuestions = await getQuestionsByQuiz(quizId);
      await recalculateResultsForQuiz(quizId, updatedQuestions);

      await fetchData();
    } catch (e) {
      console.error(e);
      alert('Error saving grade. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #e0e0e0', borderTop: '3px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const s = {
    page: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' },
    container: { maxWidth: '800px', margin: '0 auto', padding: '28px 20px' },
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>

        {/* Back */}
        <button
          onClick={() => navigate(`/teacher/quiz/${quizId}/results`)}
          style={{ border: 'none', background: 'none', fontSize: '13px', color: '#888', cursor: 'pointer', padding: '0 0 16px 0', fontFamily: 'Inter, sans-serif' }}
        >
          ← Back to Results
        </button>

        {/* Student Info */}
        {result && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '20px 24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>
                  {result.studentName}
                </h4>
                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                  {result.studentId} — {result.section || 'No section'}
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

            {/* Score Stats */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
              {[
                { label: 'Score', value: `${result.earnedPoints}/${result.totalPoints}` },
                { label: 'Percentage', value: `${result.percentage}%` },
                { label: 'Violations', value: result.totalViolations },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{ flex: 1, minWidth: '100px', background: '#fafafa', borderRadius: '10px', padding: '12px 16px', border: '1px solid #f0f0f0', textAlign: 'center' }}
                >
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
        )}

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
          const isGraded = isEssay && studentAnswer?.graded;
          const hasEssayAnswer = isEssay && studentAnswer?.essayAnswer;

          return (
            <div
              key={question.id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                marginBottom: '12px',
                overflow: 'hidden',
              }}
            >
              {/* Question Header */}
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
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
                {isEssay && hasEssayAnswer && (
                  <span style={{
                    fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '6px',
                    background: isGraded ? '#f0fdf4' : '#fffbeb',
                    color: isGraded ? '#16a34a' : '#d97706',
                    border: `1px solid ${isGraded ? '#86efac' : '#fcd34d'}`,
                  }}>
                    {isGraded ? `Graded — ${studentAnswer.awardedPoints}/${question.points} pts` : 'Needs Grading'}
                  </span>
                )}
              </div>

              {/* Question Body */}
              <div style={{ padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                  {question.questionText}
                </p>

                {isEssay ? (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888', margin: '0 0 8px 0' }}>
                      Student Answer
                    </p>
                    <div style={{
                      background: '#fafafa', borderRadius: '8px', padding: '12px 14px',
                      border: '1px solid #f0f0f0', fontSize: '13px', color: '#333', lineHeight: '1.6',
                      marginBottom: hasEssayAnswer ? '16px' : 0,
                    }}>
                      {studentAnswer?.essayAnswer || (
                        <span style={{ color: '#aaa', fontStyle: 'italic' }}>No answer provided</span>
                      )}
                    </div>

                    {/* Grading control — only shown if the student actually wrote an answer */}
                    {hasEssayAnswer && (
                      <div style={{
                        background: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}>
                        <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888' }}>
                          Award Points
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={question.points}
                          step="0.5"
                          value={gradeInputs[studentAnswer.id] ?? ''}
                          onChange={(e) => {
                            const raw = e.target.value;
                            // Allow empty/in-progress typing, but clamp once it's a valid number
                            if (raw === '') {
                              setGradeInputs((prev) => ({ ...prev, [studentAnswer.id]: '' }));
                              return;
                            }
                            const num = parseFloat(raw);
                            if (isNaN(num)) return;
                            const clamped = Math.max(0, Math.min(num, question.points));
                            setGradeInputs((prev) => ({ ...prev, [studentAnswer.id]: clamped }));
                          }}
                          style={{
                            width: '80px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            padding: '7px 10px',
                            fontSize: '13px',
                            outline: 'none',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        />
                        <span style={{ fontSize: '13px', color: '#888' }}>
                          / {question.points} pts
                        </span>
                        <button
                          onClick={() => handleSaveGrade(studentAnswer, question.points)}
                          disabled={savingId === studentAnswer.id}
                          style={{
                            marginLeft: 'auto',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            background: savingId === studentAnswer.id ? '#ccc' : '#000',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: savingId === studentAnswer.id ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {savingId === studentAnswer.id ? 'Saving...' : isGraded ? 'Update Grade' : 'Save Grade'}
                        </button>
                      </div>
                    )}
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
                        bg = '#f0fdf4';
                        border = '#86efac';
                        color = '#16a34a';
                        labelColor = '#16a34a';
                      }
                      if (isSelected && !isCorrectChoice) {
                        bg = '#fef2f2';
                        border = '#fca5a5';
                        color = '#dc2626';
                        labelColor = '#dc2626';
                      }

                      return (
                        <div
                          key={choice.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: `1px solid ${border}`,
                            background: bg,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                              border: isSelected ? `5px solid ${color}` : `2px solid #ccc`,
                              transition: 'all 0.15s',
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
                                Student
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

export default ResultDetail;