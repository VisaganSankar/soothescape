import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiUrl } from '../config/api';

const Login = () => {
  const [mode, setMode] = useState('signIn');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const endpoint = apiUrl(mode === 'signUp' ? '/register' : '/login');

      const body = mode === 'signUp'
        ? { email: username, password }
        : { email: username, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Something went wrong');
        return;
      }

      // If successful:
      login({ username, email: username }); // Using username as email since it's actually an email field
      navigate('/dashboard');
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        {/* Mode toggle buttons */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              gap: 8,
              background: 'var(--glass)',
              border: '1px solid var(--border)',
              padding: 6,
              borderRadius: 12,
              justifyContent: 'center',
            }}
          >
            <button
              className={`btn small ${mode === 'signIn' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1 }}
              type="button"
              onClick={() => {
                setMode('signIn');
                setError('');
              }}
            >
              Sign In
            </button>
            <button
              className={`btn small ${mode === 'signUp' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1 }}
              type="button"
              onClick={() => {
                setMode('signUp');
                setError('');
              }}
            >
              Sign Up
            </button>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '16px 0 6px' }}>
            {mode === 'signIn' ? 'Welcome Back' : 'Create your account'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '16px 18px',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '16px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '16px 18px',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '16px'
              }}
            />
          </div>

          {mode === 'signUp' && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '16px'
                }}
              />
            </div>
          )}

          {error && (
            <div style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {mode === 'signIn' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
