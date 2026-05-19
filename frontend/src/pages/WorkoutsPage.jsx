import { useEffect, useState } from 'react';
import { getMyWorkouts, completeWorkout } from '../services/memberService.js';
import { getAssignedMembers, createWorkout } from '../services/trainerService.js';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../services/workoutTemplateService.js';

function WorkoutsPage() {
  const role = localStorage.getItem('role')?.toLowerCase();
  const isTrainer = role === 'trainer';

  const [workouts, setWorkouts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [workoutForm, setWorkoutForm] = useState({
    name: '',
    description: '',
    date: '',
    status: 'Planned',
    memberId: ''
  });
  const [templateForm, setTemplateForm] = useState({ name: '', description: '' });
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [assigningTemplate, setAssigningTemplate] = useState(null);
  const [assignDate, setAssignDate] = useState('');
  const [assignMemberId, setAssignMemberId] = useState('');

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    setLoading(true);
    setError('');
    try {
      if (isTrainer) {
        const [membersRes, templatesRes] = await Promise.all([
          getAssignedMembers(),
          getTemplates({ limit: 100, page: 1 }),
        ]);
        setAssignedMembers(membersRes.data.members || []);
        setTemplates(templatesRes.data.templates || []);
      } else {
        const response = await getMyWorkouts({ limit: 100, page: 1 });
        setWorkouts(response.data.workouts || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeWorkout(id);
      setMessage('Workout marked complete');
      await loadWorkouts();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not complete workout');
    }
  };

  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateForm);
        setMessage('Workout plan updated');
      } else {
        await createTemplate(templateForm);
        setMessage('Workout plan created');
      }
      setTemplateForm({ name: '', description: '' });
      setEditingTemplate(null);
      await loadWorkouts();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save workout plan');
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({ name: template.name, description: template.description || '' });
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Delete this workout plan?')) return;
    try {
      await deleteTemplate(id);
      setMessage('Workout plan deleted');
      await loadWorkouts();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete workout plan');
    }
  };

  const handleOpenAssign = (template) => {
    setAssigningTemplate(template);
    setAssignDate('');
    setAssignMemberId('');
    setMessage('');
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assigningTemplate) return;
    try {
      await createWorkout({
        templateId: assigningTemplate.id,
        memberId: Number(assignMemberId),
        date: assignDate || new Date().toISOString(),
        status: 'Planned',
      });
      setMessage(`Assigned ${assigningTemplate.name} successfully`);
      setAssigningTemplate(null);
      setAssignDate('');
      setAssignMemberId('');
      await loadWorkouts();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to assign workout');
    }
  };

  return (
    <section className="dashboard-card page-block">
      <div className="page-header">
        <div>
          <p className="eyebrow">{isTrainer ? 'Trainer workout management' : 'Your workouts'}</p>
          <h1>{isTrainer ? 'Workout plans' : 'Assigned sessions'}</h1>
        </div>
      </div>

      {message && <p className="info-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p className="empty-state">Loading workouts...</p>
      ) : isTrainer ? (
        <>
          <div className="trainer-section">
            <h2>{editingTemplate ? 'Edit Workout Plan' : 'Create Workout Plan'}</h2>
            <form className="admin-form" onSubmit={handleTemplateSubmit}>
              <input
                placeholder="Plan title"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Plan description"
                value={templateForm.description}
                onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
              />
              <div className="admin-form-actions">
                <button type="submit" className="primary-button">
                  {editingTemplate ? 'Save Plan' : 'Create Plan'}
                </button>
                {editingTemplate && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setEditingTemplate(null);
                      setTemplateForm({ name: '', description: '' });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="trainer-section">
            <h2>Workout plan library</h2>
            {templates.length > 0 ? (
              templates.map((template) => (
                <div key={template.id} className="workout-item">
                  <div>
                    <h3>{template.name}</h3>
                    <p>{template.description || 'No description provided.'}</p>
                  </div>
                  <div className="trainer-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleEditTemplate(template)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleOpenAssign(template)}
                    >
                      Assign
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-state">No workout plans available.</p>
            )}
          </div>

          {assigningTemplate && (
            <div className="trainer-section">
              <h2>Assign {assigningTemplate.name}</h2>
              <form className="admin-form" onSubmit={handleAssignSubmit}>
                <select
                  value={assignMemberId}
                  onChange={(e) => setAssignMemberId(e.target.value)}
                  required
                >
                  <option value="">Select assigned member</option>
                  {assignedMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
                <input
                  type="datetime-local"
                  value={assignDate}
                  onChange={(e) => setAssignDate(e.target.value)}
                  required
                />
                <div className="admin-form-actions">
                  <button type="submit" className="primary-button">Assign to member</button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setAssigningTemplate(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      ) : workouts.length ? (
        <div className="workout-grid">
          {workouts.map((workout) => (
            <article className="workout-card" key={workout.id}>
              <h3>{workout.template?.name || workout.name || 'Assigned workout'}</h3>
              <p>{workout.template?.description || workout.notes || 'No description available.'}</p>
              <div className="workout-card-meta">
                <span>Scheduled: {workout.scheduledAt ? new Date(workout.scheduledAt).toLocaleString() : 'TBD'}</span>
                <span>Status: {workout.status || 'Unknown'}</span>
              </div>
              {workout.status !== 'Completed' && (
                <button onClick={() => handleComplete(workout.id)} className="primary-button">Mark Complete</button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state-card">
          <p>No workouts assigned yet.</p>
        </div>
      )}
    </section>
  );
}

export default WorkoutsPage;
