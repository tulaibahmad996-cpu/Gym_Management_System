import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService.js';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await login({ email, password });
      const normalizedRole = response.data.user.role?.toLowerCase() || 'member';
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', normalizedRole);
      localStorage.setItem('name', `${response.data.user.firstName || ''} ${response.data.user.lastName || ''}`);
      if (normalizedRole === 'admin') navigate('/admin');
      else if (normalizedRole === 'trainer') navigate('/trainer');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <section className="auth-split">
      <div className="auth-visual">
        <h2>Welcome Back</h2>
        <p>Login to manage workouts, members, and gym progress in one modern platform.</p>
      </div>
      <div className="auth-card compact-card">
        <h1>Sign In</h1>
        <form onSubmit={handleLogin} className="form-stack">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="primary-button">Login</button>
        </form>
        <p className="form-note">
          New here? <Link to="/register">Create account</Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
