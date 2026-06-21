import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuestionsByQuiz } from '../../services/questionService';
import { getAllQuizzes } from '../../services/adminService';
import AdminNavbar from '../../components/admin/Navbar';

const AdminQuizQuestions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsData, quizzesData] = await Promise.all([
          getQuestionsByQuiz(quizId),
          getAllQuizzes(),
        ]);
        setQuestions(questionsData);
        setQuiz(quizzesData.find((q) => q.id === quizId));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId]);

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
      <AdminNavbar />
      <div style={s.container}>

        {/* Back */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={{ border: 'none', background: 'none', fontSize: '13px', color: '#888', cursor: 'pointer', padding: '0 0 16px 0', fontFamily: 'Inter, sans-serif' }}
        >
          ← Back to Dashboard
        </button>

        {/* Quiz Info */}
        {quiz && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '20px 24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>
                  {quiz.title}
                </h4>
                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                  Code: {quiz.quizCode} — {quiz.timeLimit} mins
                </p>
              </div>
              <span style={{
                fontSize: '13px', fontWeight: '700', padding: '6px 14px', borderRadius: '8px',
                background: quiz.isActive ? '#f0fdf4' : '#fafafa',
                color: quiz.isActive ? '#16a34a' : '#888',
                border: `1px solid ${quiz.isActive ? '#86efac' : '#e0e0e0'}`,
              }}>
                {quiz.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        )}

        {/* Questions */}
        <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888', marginBottom: '12px' }}>
          Questions ({questions.length})
        </p>

        {questions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#888' }}>
            <p style={{ fontSize: '14px' }}>No questions found for this quiz</p>
          </div>
        ) : (
          questions.map((question, index) => {
            const isEssay = question.questionType === 'essay';

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
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px',
                    background: '#f0f0f0', color: '#555', textTransform: 'capitalize',
                  }}>
                    {question.questionType}
                  </span>
                </div>

                {/* Question Body */}
                <div style={{ padding: '16px 20px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                    {question.questionText}
                  </p>

                  {isEssay ? (
                    <div style={{
                      background: '#fafafa', borderRadius: '8px', padding: '12px 14px',
                      border: '1px solid #f0f0f0', fontSize: '13px', color: '#aaa', fontStyle: 'italic',
                    }}>
                      Essay question — answered freely by students
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {question.choices?.map((choice) => (
                        <div
                          key={choice.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: `1px solid ${choice.isCorrect ? '#86efac' : '#f0f0f0'}`,
                            background: choice.isCorrect ? '#f0fdf4' : '#fafafa',
                          }}
                        >
                          <span style={{
                            fontSize: '13px',
                            color: choice.isCorrect ? '#16a34a' : '#555',
                            fontWeight: choice.isCorrect ? '600' : '400',
                          }}>
                            {choice.choiceText}
                          </span>
                          {choice.isCorrect && (
                            <span style={{
                              fontSize: '11px', fontWeight: '700', padding: '2px 8px',
                              borderRadius: '999px', background: '#dcfce7', color: '#16a34a',
                            }}>
                              Correct
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminQuizQuestions;