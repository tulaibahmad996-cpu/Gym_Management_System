import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService.js';

function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <section className="auth-split reverse-layout">
      <div className="auth-card compact-card">
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit} className="form-stack">
          <label>First Name</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} required />
          <label>Last Name</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} required />
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
          <label>Role</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="member">Member</option>
            <option value="trainer">Trainer</option>
          </select>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="primary-button">Register</button>
        </form>
        <p className="form-note">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
      <div className="auth-visual">
        <h2>Train like a pro</h2>
        <p>Start managing gym members, workout plans, and progress tracking in a polished dashboard environment.</p>
      </div>
    </section>
  );
}

export default RegisterPage;
