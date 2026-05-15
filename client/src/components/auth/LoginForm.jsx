import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../api/index.js';
import { Spinner } from '../common/Spinner';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);

    try {
      const response = await login({ email, password });
      authLogin(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }} className="flex items-center justify-center p-4">
      <div style={{ maxWidth: '448px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }} className="w-full border rounded-lg p-8">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>Peblo</span> Notes
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to your workspace</p>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '24px' }}>
          Don't have an account?{' '}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
