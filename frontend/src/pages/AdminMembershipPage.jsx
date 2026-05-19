import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { getMembershipPlans, createMembership, updateMembership, deleteMembership, assignMembersToMembership } from '../services/membershipService.js';
import { getUsers } from '../services/userService.js';

function AdminMembershipPage() {
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({ title: '', description: '', price: '', duration: '' });
  const [editingId, setEditingId] = useState(null);
  const [assignPlanId, setAssignPlanId] = useState(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [viewMembersId, setViewMembersId] = useState(null);
  const [viewMembersPlan, setViewMembersPlan] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, membersRes] = await Promise.all([
        getMembershipPlans({ limit: 100, page: 1 }),
        getUsers({ role: 'member', limit: 200, page: 1 }),
      ]);
      setPlans(plansRes.data.memberships || []);
      setMembers(membersRes.data.users || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load membership data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: '', description: '', price: '', duration: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMembership(editingId, form);
        setMessage('Membership plan updated');
      } else {
        await createMembership(form);
        setMessage('Membership plan created');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save membership plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingId(plan.id);
    setForm({
      title: plan.title,
      description: plan.description || '',
      price: plan.price,
      duration: plan.duration || '',
    });
    setMessage('Editing membership plan');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await deleteMembership(id);
      setMessage('Membership plan deleted');
      if (editingId === id) resetForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete plan');
    }
  };

  const handleAssign = (plan) => {
    setAssignPlanId(plan.id);
    setSelectedMemberIds(plan.assignments?.map((assignment) => assignment.member?.id) || []);
    setMessage('Assign members to plan');
  };

  const handleViewMembers = (plan) => {
    setViewMembersId(plan.id);
    setViewMembersPlan(plan);
  };

  const closeViewMembers = () => {
    setViewMembersId(null);
    setViewMembersPlan(null);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignPlanId) return;
    try {
      await assignMembersToMembership(assignPlanId, { memberIds: selectedMemberIds });
      setMessage('Members assigned successfully');
      setAssignPlanId(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign members');
    }
  };

  return (
    <div className="dashboard-shell">
      <Sidebar role="admin" />
      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">Membership Management</p>
            <h1>Membership Plans</h1>
          </div>
        </div>

        {message && <p className="info-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="admin-section">
          <h2>{editingId ? 'Edit membership plan' : 'Create membership plan'}</h2>
          <form className="admin-form" onSubmit={handleSubmit}>
            <input placeholder="Plan title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <input placeholder="Duration (e.g. 3 months)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="admin-form-actions">
              <button type="submit" className="primary-button">{editingId ? 'Update plan' : 'Create plan'}</button>
              {editingId && (<button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>)}
            </div>
          </form>
        </div>

        <div className="admin-section">
          <h2>Membership Plans</h2>
          {loading ? <p className="empty-state">Loading plans...</p> : (
            <div className="membership-grid">
              {plans.length ? plans.map((plan) => (
                <article className="membership-card" key={plan.id}>
                  <div className="membership-label">{plan.duration || 'Plan'}</div>
                  <h3>{plan.title}</h3>
                  <p>{plan.description || 'No description provided.'}</p>
                  <p className="membership-meta">${plan.price}</p>
                  <p>
                    <button type="button" className="link-button" onClick={() => handleViewMembers(plan)}>
                      {(plan.assignments || []).length} assigned members
                    </button>
                  </p>
                  <div className="admin-form-actions">
                    <button type="button" className="secondary-button" onClick={() => handleEdit(plan)}>Edit</button>
                    <button type="button" className="secondary-button" onClick={() => handleAssign(plan)}>Assign Members</button>
                    <button type="button" className="delete-btn" onClick={() => handleDelete(plan.id)}>Delete</button>
                  </div>
                </article>
              )) : <p className="empty-state">No membership plans available.</p>}
            </div>
          )}
        </div>

        {assignPlanId && (
          <div className="admin-section">
            <h2>Assign Members</h2>
            <form className="admin-form" onSubmit={handleAssignSubmit}>
              <label>Select members for this plan</label>
              <select multiple value={selectedMemberIds.map(String)} onChange={(e) => setSelectedMemberIds(Array.from(e.target.selectedOptions).map((opt) => Number(opt.value)))}>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>
                ))}
              </select>
              <div className="admin-form-actions">
                <button type="submit" className="primary-button">Assign selected members</button>
                <button type="button" className="secondary-button" onClick={() => setAssignPlanId(null)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {viewMembersId && viewMembersPlan && (
          <div className="admin-section">
            <h2>Members Subscribed to {viewMembersPlan.title}</h2>
            {viewMembersPlan.assignments && viewMembersPlan.assignments.length > 0 ? (
              <div className="members-table">
                <table>
                  <thead>
                    <tr>
                      <th>Member Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewMembersPlan.assignments.map((assignment, index) => (
                      <tr key={index}>
                        <td>{assignment.member?.firstName} {assignment.member?.lastName}</td>
                        <td>{assignment.member?.email}</td>
                        <td>{assignment.member?.phone || 'N/A'}</td>
                        <td>
                          <span className={`status-badge status-${assignment.status}`}>
                            {assignment.status}
                          </span>
                        </td>
                        <td>{assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : 'N/A'}</td>
                        <td>{assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-state">No members assigned to this plan yet.</p>
            )}
            <div className="admin-form-actions">
              <button type="button" className="secondary-button" onClick={closeViewMembers}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMembershipPage;
