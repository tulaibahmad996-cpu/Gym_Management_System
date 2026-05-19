import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import Sidebar from '../components/Sidebar.jsx';
import Card from '../components/Card.jsx';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService.js';
import { createMembership, getMemberships, updateMembership, deleteMembership } from '../services/membershipService.js';
import { createWorkout, updateWorkout, deleteWorkout } from '../services/workoutService.js';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [message, setMessage] = useState('');

  const [userForm, setUserForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'member' });
  const [membershipForm, setMembershipForm] = useState({ title: '', description: '', price: '', status: 'Active', startDate: '', endDate: '', memberId: '' });
  const [workoutForm, setWorkoutForm] = useState({ name: '', description: '', date: '', status: 'Planned', memberId: '', trainerId: '' });

  const [editingUserId, setEditingUserId] = useState(null);
  const [editingMembershipId, setEditingMembershipId] = useState(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);

  const [userEditForm, setUserEditForm] = useState({ firstName: '', lastName: '', email: '', role: 'member' });
  const [membershipEditForm, setMembershipEditForm] = useState({ title: '', description: '', price: '', status: 'Active', startDate: '', endDate: '', memberId: '' });
  const [workoutEditForm, setWorkoutEditForm] = useState({ name: '', description: '', date: '', status: 'Planned', memberId: '', trainerId: '' });

  const members = users.filter((user) => user.role === 'member');
  const trainers = users.filter((user) => user.role === 'trainer');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, usersRes, membershipsRes, workoutsRes] = await Promise.all([
        api.get('/dashboard/admin'),
        getUsers({}),
        getMemberships({ limit: 5, page: 1 }),
        api.get('/workouts', { params: { limit: 5, page: 1 } }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setMemberships(membershipsRes.data.memberships || []);
      setWorkouts(workoutsRes.data.workouts || []);
      setWorkoutCount(workoutsRes.data.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(userForm);
      setMessage('User created successfully');
      setUserForm({ firstName: '', lastName: '', email: '', password: '', role: 'Member' });
      setShowUserForm(false);
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    setUserEditForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role });
    setShowUserForm(false);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editingUserId, userEditForm);
      setMessage('User updated successfully');
      setEditingUserId(null);
      setUserEditForm({ firstName: '', lastName: '', email: '', role: 'Member' });
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteUser(userId);
      setMessage('User deleted');
      if (editingUserId === userId) setEditingUserId(null);
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleCreateMembership = async (e) => {
    e.preventDefault();
    try {
      await createMembership(membershipForm);
      setMessage('Membership created');
      setMembershipForm({ title: '', description: '', price: '', status: 'Active', startDate: '', endDate: '', memberId: '' });
      setShowMembershipForm(false);
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to create membership');
    }
  };

  const handleEditMembership = (membership) => {
    setEditingMembershipId(membership.id);
    setMembershipEditForm({
      title: membership.title,
      description: membership.description,
      price: membership.price,
      status: membership.status,
      startDate: membership.startDate,
      endDate: membership.endDate,
      memberId: membership.member?.id || '',
    });
    setShowMembershipForm(false);
  };

  const handleUpdateMembership = async (e) => {
    e.preventDefault();
    try {
      await updateMembership(editingMembershipId, membershipEditForm);
      setMessage('Membership updated successfully');
      setEditingMembershipId(null);
      setMembershipEditForm({ title: '', description: '', price: '', status: 'Active', startDate: '', endDate: '', memberId: '' });
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update membership');
    }
  };

  const handleDeleteMembership = async (id) => {
    if (!window.confirm('Delete this membership?')) return;
    try {
      await deleteMembership(id);
      setMessage('Membership deleted');
      if (editingMembershipId === id) setEditingMembershipId(null);
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete membership');
    }
  };

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...workoutForm, scheduledAt: workoutForm.date };
      await createWorkout(payload);
      setMessage('Workout created');
      setWorkoutForm({ name: '', description: '', date: '', status: 'Planned', memberId: '', trainerId: '' });
      setShowWorkoutForm(false);
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to create workout');
    }
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkoutId(workout.id);
    setWorkoutEditForm({
      name: workout.name,
      description: workout.description,
      date: workout.scheduledAt?.slice(0, 16) || '',
      status: workout.status,
      memberId: workout.member?.id || '',
      trainerId: workout.trainer?.id || '',
    });
    setShowWorkoutForm(false);
  };

  const handleUpdateWorkout = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...workoutEditForm, scheduledAt: workoutEditForm.date };
      await updateWorkout(editingWorkoutId, payload);
      setMessage('Workout updated successfully');
      setEditingWorkoutId(null);
      setWorkoutEditForm({ name: '', description: '', date: '', status: 'Planned', memberId: '', trainerId: '' });
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update workout');
    }
  };

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm('Delete this workout?')) return;
    try {
      await deleteWorkout(id);
      setMessage('Workout deleted');
      if (editingWorkoutId === id) setEditingWorkoutId(null);
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete workout');
    }
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditingMembershipId(null);
    setEditingWorkoutId(null);
    setUserEditForm({ firstName: '', lastName: '', email: '', role: 'Member' });
    setMembershipEditForm({ title: '', description: '', price: '', status: 'Active', startDate: '', endDate: '', memberId: '' });
    setWorkoutEditForm({ name: '', description: '', date: '', status: 'Planned', memberId: '', trainerId: '' });
  };

  return (
    <div className="dashboard-shell">
      <Sidebar role="Admin" />
      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">Admin Overview</p>
            <h1>Agency control center</h1>
          </div>
        </div>
        <div className="card-grid">
          <Card title="Total Members" value={stats?.totalUsers ?? '...'} />
          <Card title="Active Memberships" value={stats?.totalMemberships ?? '...'} />
          <Card title="Trainers" value={stats?.totalTrainers ?? '...'} />
          <Card title="Total Workouts" value={workoutCount || '...'} />
        </div>

        <div className="admin-section">
          <h2>Quick actions</h2>
          <div className="admin-section-actions">
            <Link to="/admin/memberships" className="primary-button">Manage Memberships</Link>
            <Link to="/admin/trainers" className="secondary-button">Manage Trainers</Link>
            <Link to="/admin/workouts" className="secondary-button">Manage Workouts</Link>
          </div>
        </div>

        {message && <p className="info-message">{message}</p>}

        <div className="admin-section">
          <h2>User Management</h2>
          <div className="admin-section-actions">
            <button onClick={() => { cancelEdit(); setShowUserForm(!showUserForm); }} className="primary-button">+ Add User</button>
          </div>
          {showUserForm && (
            <form className="admin-form" onSubmit={handleCreateUser}>
              <input placeholder="First Name" value={userForm.firstName} onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })} required />
              <input placeholder="Last Name" value={userForm.lastName} onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })} required />
              <input type="email" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
              <input type="password" placeholder="Password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required />
              <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                <option value="member">Member</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="primary-button">Create User</button>
            </form>
          )}

          {editingUserId && (
            <form className="admin-form" onSubmit={handleUpdateUser}>
              <h3>Edit User</h3>
              <input placeholder="First Name" value={userEditForm.firstName} onChange={(e) => setUserEditForm({ ...userEditForm, firstName: e.target.value })} required />
              <input placeholder="Last Name" value={userEditForm.lastName} onChange={(e) => setUserEditForm({ ...userEditForm, lastName: e.target.value })} required />
              <input type="email" placeholder="Email" value={userEditForm.email} onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })} required />
              <select value={userEditForm.role} onChange={(e) => setUserEditForm({ ...userEditForm, role: e.target.value })}>
                <option value="member">Member</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
              <div className="admin-form-actions">
                <button type="submit" className="primary-button">Update User</button>
                <button type="button" className="secondary-button" onClick={cancelEdit}>Cancel</button>
              </div>
            </form>
          )}

          <div className="user-list">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="user-item">
                <div>
                  <p>{user.firstName} {user.lastName}</p>
                  <span>{user.role}</span>
                </div>
                <div className="item-actions">
                  <button onClick={() => handleEditUser(user)} className="secondary-button">Edit</button>
                  <button onClick={() => handleDeleteUser(user.id)} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
