import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, updateQuiz } from '../../services/quizService';
import Navbar from '../../components/teacher/Navbar';

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quiz = await getQuiz(id);
        if (!quiz) {
          setError('Quiz not found.');
          return;
        }
        setForm({
          title: quiz.title || '',
          description: quiz.description || '',
          timeLimit: quiz.timeLimit || 30,
          maxViolations: quiz.maxViolations || 3,
          randomizeQuestions: !!quiz.randomizeQuestions,
          randomizeChoices: !!quiz.randomizeChoices,
          allowReviewAnswers: !!quiz.allowReviewAnswers,
          availableFrom: quiz.availableFrom || '',
          availableUntil: quiz.availableUntil || '',
        });
      } catch (err) {
        setError('Error loading quiz.');
      } finally {
        setFetching(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateQuiz(id, form);
      navigate(`/teacher/quiz/${id}`);
    } catch (err) {
      setError(err.message || 'Error updating quiz');
    } finally {
      setLoading(false);
    }
  };

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

  if (fetching) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #e0e0e0', borderTop: '3px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!form) return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '28px 20px' }}>
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px',
          padding: '14px 16px', fontSize: '13px', color: '#dc2626',
        }}>
          {error || 'Quiz not found.'}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '28px 20px' }}>

        {/* Back Button */}
        <button
          onClick={() => navigate(`/teacher/quiz/${id}`)}
          style={{
            border: 'none',
            background: 'none',
            fontSize: '13px',
            color: '#888',
            cursor: 'pointer',
            padding: '0 0 16px 0',
            fontFamily: 'Inter, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          ← Back to Quiz
        </button>

        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
        }}>
          {/* Card Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <h5 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>Edit Quiz</h5>
            <p style={{ fontSize: '13px', color: '#888', margin: '4px 0 0 0' }}>
              Update the details below and save your changes
            </p>
          </div>

          {/* Card Body */}
          <div style={{ padding: '24px' }}>
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13px',
                color: '#dc2626',
                marginBottom: '20px',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Title</label>
                <input
                  type="text"
                  placeholder="Enter quiz title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  placeholder="Enter quiz description (optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    lineHeight: '1.6',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Time Limit (minutes)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.timeLimit}
                    onChange={(e) => setForm({ ...form, timeLimit: parseInt(e.target.value) })}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Max Violations</label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxViolations}
                    onChange={(e) => setForm({ ...form, maxViolations: parseInt(e.target.value) })}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Available From</label>
                  <input
                    type="datetime-local"
                    value={form.availableFrom}
                    onChange={(e) => setForm({ ...form, availableFrom: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Available Until</label>
                  <input
                    type="datetime-local"
                    value={form.availableUntil}
                    onChange={(e) => setForm({ ...form, availableUntil: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Options */}
              <div style={{
                background: '#fafafa',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid #f0f0f0',
                marginBottom: '24px',
              }}>
                <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888', margin: '0 0 12px 0' }}>
                  Options
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'randomizeQuestions', label: 'Randomize Questions', desc: 'Shuffle question order for each student' },
                    { key: 'randomizeChoices', label: 'Randomize Choices', desc: 'Shuffle answer choices for each question' },
                    { key: 'allowReviewAnswers', label: 'Allow Answer Review', desc: 'Let students check their results and review answers after submitting' },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '10px 12px',
                        border: form[opt.key] ? '2px solid #000' : '1px solid #e0e0e0',
                        borderRadius: '8px',
                        background: '#fff',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form[opt.key]}
                        onChange={(e) => setForm({ ...form, [opt.key]: e.target.checked })}
                        style={{ accentColor: '#000', width: '16px', height: '16px' }}
                      />
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>{opt.label}</p>
                        <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => navigate(`/teacher/quiz/${id}`)}
                  style={{
                    flex: 1,
                    padding: '13px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    background: '#fff',
                    color: '#333',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '13px',
                    border: 'none',
                    borderRadius: '8px',
                    background: loading ? '#ccc' : '#000',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditQuiz;