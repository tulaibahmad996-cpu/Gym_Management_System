import { useEffect, useState } from 'react';
import api from '../services/api.js';
import Sidebar from '../components/Sidebar.jsx';
import Card from '../components/Card.jsx';
import { getAssignedMembers, createWorkout, updateWorkoutStatus, updateWorkout, deleteWorkout } from '../services/trainerService.js';

function TrainerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [workoutForm, setWorkoutForm] = useState({
    name: '',
    description: '',
    date: '',
    status: 'Planned',
    memberId: ''
  });
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({});

  useEffect(() => {
    loadTrainerDashboard();
  }, []);

  const loadTrainerDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const [dashRes, membersRes] = await Promise.all([
        api.get('/dashboard/trainer'),
        getAssignedMembers(),
      ]);

      setDashboard(dashRes.data);
      setAssignedMembers(membersRes?.data?.members || []);
      setWorkoutPlans(dashRes?.data?.workoutPlans || []);

      const statuses = {};
      (dashRes?.data?.workoutPlans || []).forEach((plan) => {
        statuses[plan.id] = plan.status;
      });

      setStatusUpdate(statuses);

    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ SAFE TOGGLE FUNCTION
  const toggleWorkoutForm = () => {
    console.log("Toggle clicked:", !showWorkoutForm);
    setShowWorkoutForm(prev => !prev);
  };

  const handleCreateWorkout = async (e) => {
    e.preventDefault();

    try {
      if (editingWorkout) {
        await updateWorkout(editingWorkout.id, {
          name: workoutForm.name,
          description: workoutForm.description,
          scheduledAt: workoutForm.date,
          status: workoutForm.status,
        });
        setMessage('Workout updated successfully');
      } else {
        await createWorkout({
          name: workoutForm.name,
          description: workoutForm.description,
          date: workoutForm.date,
          status: workoutForm.status,
          memberId: Number(workoutForm.memberId),
        });
        setMessage('Workout created successfully');
      }

      setWorkoutForm({
        name: '',
        description: '',
        date: '',
        status: 'Planned',
        memberId: ''
      });
      setEditingWorkout(null);
      setShowWorkoutForm(false);
      await loadTrainerDashboard();
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || 'Failed to save workout');
    }
  };

  const handleStatusChange = (id, status) => {
    setStatusUpdate((prev) => ({
      ...prev,
      [id]: status
    }));
  };

  const handleUpdateWorkoutStatus = async (id) => {
    try {
      await updateWorkoutStatus(id, {
        status: statusUpdate[id]
      });

      setMessage('Workout status updated');
      await loadTrainerDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update workout status');
    }
  };

  const handleEditWorkout = (plan) => {
    setEditingWorkout(plan);
    setShowWorkoutForm(true);
    setWorkoutForm({
      name: plan.name || '',
      description: plan.description || '',
      date: plan.scheduledAt ? plan.scheduledAt.replace(' ', 'T') : '',
      status: plan.status || 'Planned',
      memberId: plan.member?.id || ''
    });
  };

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm('Delete this workout plan?')) return;
    try {
      await deleteWorkout(id);
      setMessage('Workout deleted successfully');
      await loadTrainerDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete workout');
    }
  };

  return (
    <div className="dashboard-shell">

      <Sidebar role="Trainer" />

      <div className="dashboard-content">

        <div className="page-header">
          <div>
            <p className="eyebrow">Trainer workspace</p>
            <h1>Manage your clients</h1>
          </div>
        </div>

        <div className="card-grid">
          <Card title="Assigned Members" value={assignedMembers?.length || 0} />
          <Card title="Workout Plans" value={workoutPlans?.length || 0} />
        </div>

        {message && <p className="info-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <p className="empty-state">Loading trainer dashboard...</p>
        ) : (
          <>
            {/* ================= CREATE WORKOUT ================= */}
            <div className="trainer-section">
              <h2>Create Workout Plan</h2>

              <button
                type="button"
                onClick={toggleWorkoutForm}
                className="primary-button"
              >
                {showWorkoutForm ? 'Close Form' : '+ New Workout'}
              </button>

              {/* FORCE VISIBILITY CHECK */}
              {showWorkoutForm && (
                <div style={{ marginTop: "20px" }}>
                  <form className="admin-form" onSubmit={handleCreateWorkout}>

                    <input
                      placeholder="Workout Name"
                      value={workoutForm.name}
                      onChange={(e) =>
                        setWorkoutForm({ ...workoutForm, name: e.target.value })
                      }
                      required
                    />

                    <textarea
                      placeholder="Description"
                      value={workoutForm.description}
                      onChange={(e) =>
                        setWorkoutForm({ ...workoutForm, description: e.target.value })
                      }
                    />

                    <input
                      type="datetime-local"
                      value={workoutForm.date}
                      onChange={(e) =>
                        setWorkoutForm({ ...workoutForm, date: e.target.value })
                      }
                      required
                    />

                    <select
                      value={workoutForm.status}
                      onChange={(e) =>
                        setWorkoutForm({ ...workoutForm, status: e.target.value })
                      }
                    >
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <select
                      value={workoutForm.memberId}
                      onChange={(e) =>
                        setWorkoutForm({ ...workoutForm, memberId: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Member</option>

                      {assignedMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.firstName} {member.lastName}
                        </option>
                      ))}
                    </select>

                    <button type="submit" className="primary-button">
                      {editingWorkout ? 'Save Changes' : 'Create Workout'}
                    </button>
                    {editingWorkout && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          setEditingWorkout(null);
                          setWorkoutForm({ name: '', description: '', date: '', status: 'Planned', memberId: '' });
                        }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </form>
                </div>
              )}
            </div>

            {/* ================= WORKOUT LIST ================= */}
            <div className="trainer-section">
              <h2>Workout Plans</h2>

              {workoutPlans.length > 0 ? (
                workoutPlans.map((plan) => (
                  <div key={plan.id} className="workout-item">
                    <div>
                      <h3>{plan.name}</h3>
                      <p>{plan.description}</p>
                      <p>
                        {plan.member?.firstName} {plan.member?.lastName}
                      </p>
                      <p>Status: <b>{plan.status}</b></p>
                    </div>

                    <div className="trainer-actions">
                      <select
                        value={statusUpdate[plan.id] || plan.status}
                        onChange={(e) =>
                          handleStatusChange(plan.id, e.target.value)
                        }
                      >
                        <option value="Planned">Planned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>

                      <button
                        onClick={() => handleUpdateWorkoutStatus(plan.id)}
                        className="primary-button"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleEditWorkout(plan)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDeleteWorkout(plan.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No workouts found.</p>
              )}
            </div>

            {/* ================= MEMBERS ================= */}
            <div className="trainer-section">
              <h2>My Athletes</h2>

              {assignedMembers.length > 0 ? (
                assignedMembers.map((member) => (
                  <div key={member.id} className="member-card">
                    <p>{member.firstName} {member.lastName}</p>
                  </div>
                ))
              ) : (
                <p>No assigned members yet.</p>
              )}
            </div>

          </>
        )}
      </div>
    </div>
  );
}

export default TrainerDashboard;