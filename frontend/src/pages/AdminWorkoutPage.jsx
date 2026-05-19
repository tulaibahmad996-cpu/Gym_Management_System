import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../services/workoutTemplateService.js';

function AdminWorkoutPage() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const templatesRes = await getTemplates({ limit: 100, page: 1 });
      setTemplates(templatesRes.data.templates || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load workout plans');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTemplate(editingId, form);
        setMessage('Workout plan updated');
      } else {
        await createTemplate(form);
        setMessage('Workout plan created');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save workout plan');
    }
  };

  const handleEdit = (template) => {
    setEditingId(template.id);
    setForm({ name: template.name || '', description: template.description || '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout plan?')) return;
    try {
      await deleteTemplate(id);
      setMessage('Workout plan deleted');
      if (editingId === id) resetForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete workout plan');
    }
  };

  return (
    <div className="dashboard-shell">
      <Sidebar role="admin" />
      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">Workout Management</p>
            <h1>Workout plans</h1>
          </div>
        </div>

        {message && <p className="info-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="admin-section">
          <h2>{editingId ? 'Edit workout plan' : 'Create workout plan'}</h2>
          <form className="admin-form" onSubmit={handleSubmit}>
            <input placeholder="Workout name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="admin-form-actions">
              <button type="submit" className="primary-button">{editingId ? 'Save workout plan' : 'Create workout plan'}</button>
              {editingId && <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </div>

        <div className="admin-section">
          <h2>Workout plan library</h2>
          {templates.length ? templates.map((template) => (
            <div key={template.id} className="workout-item">
              <div>
                <h3>{template.name}</h3>
                <p>{template.description || 'No description'}</p>
              </div>
              <div className="item-actions">
                <button onClick={() => handleEdit(template)} className="secondary-button">Edit</button>
                <button onClick={() => handleDelete(template.id)} className="delete-btn">Delete</button>
              </div>
            </div>
          )) : <p className="empty-state">No workout plans found.</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminWorkoutPage;
