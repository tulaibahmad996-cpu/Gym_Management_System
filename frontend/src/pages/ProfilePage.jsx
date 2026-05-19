import { useState, useEffect } from 'react';
import api from '../services/api.js';
import Sidebar from '../components/Sidebar.jsx';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/users/profile').then((response) => {
      setProfile(response.data);
      setForm({ firstName: response.data.firstName, lastName: response.data.lastName, email: response.data.email });
    }).catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('firstName', form.firstName);
    data.append('lastName', form.lastName);
    data.append('email', form.email);
    try {
      const fileInput = document.querySelector('#profileImage');
      if (fileInput.files.length) data.append('profileImage', fileInput.files[0]);
      await api.put('/users/profile', data);
      setMessage('Profile updated successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="dashboard-shell">
      <Sidebar role={profile?.role || 'Member'} />
      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">Profile</p>
            <h1>Manage your account</h1>
          </div>
        </div>
        <div className="profile-layout">
          <div className="profile-card">
            <div className="profile-avatar" style={{ backgroundImage: `url(${profile?.profileImage || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&q=60'})` }} />
            <div>
              <h2>{profile?.firstName} {profile?.lastName}</h2>
              <p>{profile?.email}</p>
              <span className="profile-badge">{profile?.role}</span>
            </div>
          </div>
          <div className="profile-form-card">
            <form className="profile-form" onSubmit={handleSubmit}>
              <label>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required />
              <label>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required />
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
              <label>Profile Image</label>
              <input id="profileImage" type="file" accept="image/*" />
              <button type="submit" className="primary-button">Save changes</button>
              {message && <p className="success-message">{message}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
