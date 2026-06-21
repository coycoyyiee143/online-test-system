import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createQuiz } from '../../services/quizService';
import Navbar from '../../components/teacher/Navbar';

const CreateQuiz = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    maxViolations: 3,
    randomizeQuestions: false,
    randomizeChoices: false,
    availableFrom: '',
    availableUntil: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { id } = await createQuiz(user.uid, form);
      navigate(`/teacher/quiz/${id}`);
    } catch (err) {
      setError(err.message || 'Error creating quiz');
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

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '28px 20px' }}>

        {/* Back Button */}
        <button
          onClick={() => navigate('/teacher/dashboard')}
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
          ← Back to Dashboard
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
            <h5 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>Create New Quiz</h5>
            <p style={{ fontSize: '13px', color: '#888', margin: '4px 0 0 0' }}>
              Fill in the details below to create a new quiz
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

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
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
                {loading ? 'Creating...' : 'Create Quiz'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;