import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { userData } = await loginUser(email, password);
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/teacher/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
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
        maxWidth: '380px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 4px 0' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            Sign in to your teacher account
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '13px',
            color: '#dc2626',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ height: '1px', background: '#f0f0f0', margin: '20px 0' }} />

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#888', margin: '0 0 8px 0' }}>
            No account yet?{' '}
            <Link to="/teacher/register" style={{ color: '#000', fontWeight: '600', textDecoration: 'none' }}>
              Register here
            </Link>
          </p>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            Are you a student?{' '}
            <Link to="/" style={{ color: '#000', fontWeight: '600', textDecoration: 'none' }}>
              Join a quiz
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;