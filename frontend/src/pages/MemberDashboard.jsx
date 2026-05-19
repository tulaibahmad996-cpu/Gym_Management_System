import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { getMyWorkouts, getMyMembership, completeWorkout } from '../services/memberService.js';

function MemberDashboard() {
  const [membership, setMembership] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadMemberDashboard();
  }, []);

  const loadMemberDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [workoutsRes, membershipRes] = await Promise.all([
        getMyWorkouts({ limit: 10, page: 1 }),
        getMyMembership(),
      ]);
      setWorkouts(workoutsRes.data.workouts || []);
      setMembership(membershipRes.data || null);
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWorkout = async (workoutId) => {
    try {
      await completeWorkout(workoutId);
      setMessage('Workout marked complete.');
      await loadMemberDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete workout');
    }
  };

  const membershipData = membership?.membership || null;
  const hasMembership = Boolean(membershipData?.title);
  const activeWorkouts = workouts.filter((w) => w.status !== 'Completed');

  return (
    <div className="dashboard-shell">
      <Sidebar role="Member" />
      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">Member dashboard</p>
            <h1>Simple view</h1>
            <p className="page-subtitle">Subscribe to a membership plan and complete your assigned workouts.</p>
          </div>
        </div>

        {message && <p className="info-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <p className="empty-state">Loading your dashboard...</p>
        ) : (
          <>
            <section className="member-section">
              <div className="section-header">
                <h2>Membership</h2>
              </div>
              <div className="member-card">
                {hasMembership ? (
                  <>
                    <h3>{membershipData.title}</h3>
                    <p>{membershipData.description || 'No membership description available.'}</p>
                    <p>Status: <strong>{membership.status}</strong></p>
                    <p>Valid: {membership.startDate || 'N/A'} — {membership.endDate || 'N/A'}</p>
                    <Link to="/membership" className="secondary-button">Manage membership</Link>
                  </>
                ) : (
                  <>
                    <p>You do not have an active membership.</p>
                    <Link to="/membership" className="primary-button">Subscribe now</Link>
                  </>
                )}
              </div>
            </section>

            <section className="member-section">
              <div className="section-header">
                <h2>Assigned workouts</h2>
              </div>
              {workouts.length ? (
                <div className="workout-grid">
                  {workouts.map((workout) => (
                    <article key={workout.id} className="workout-card">
                      <h3>{workout.template?.name || workout.name || 'Assigned workout'}</h3>
                      <p>{workout.template?.description || workout.notes || 'No description available.'}</p>
                      <div className="workout-card-meta">
                        <span>Scheduled: {workout.scheduledAt ? new Date(workout.scheduledAt).toLocaleString() : 'TBD'}</span>
                        <span>Status: {workout.status || 'Unknown'}</span>
                      </div>
                      {workout.status !== 'Completed' && (
                        <button onClick={() => handleCompleteWorkout(workout.id)} className="primary-button">Mark Complete</button>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state-card">
                  <p>No workouts assigned yet.</p>
                  <Link to="/workouts" className="primary-button">View workouts</Link>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default MemberDashboard;
