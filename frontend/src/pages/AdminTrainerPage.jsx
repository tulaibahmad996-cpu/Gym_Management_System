import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { getAdminTrainers } from '../services/adminService.js';
import { assignMembersToTrainer } from '../services/trainerService.js';
import { getUsers } from '../services/userService.js';

function AdminTrainerPage() {
  const [trainers, setTrainers] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [viewMembersTrainer, setViewMembersTrainer] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trainersRes, membersRes] = await Promise.all([
        getAdminTrainers(),
        getUsers({ role: 'member', limit: 200, page: 1 }),
      ]);
      setTrainers(trainersRes.data.trainers || []);
      setMembers(membersRes.data.users || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load trainer data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrainer = (trainer) => {
    setSelectedTrainer(trainer);
    setSelectedMemberIds([]);
    setMessage(`Adding new members to ${trainer.firstName}`);
  };

  const handleViewMembers = (trainer) => {
    setViewMembersTrainer(trainer);
  };

  const closeViewMembers = () => {
    setViewMembersTrainer(null);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrainer) return;
    try {
      await assignMembersToTrainer({ trainerId: selectedTrainer.id, memberIds: selectedMemberIds });
      setMessage('Trainer assignments updated');
      await loadData();
      setSelectedTrainer(null);
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
            <p className="eyebrow">Trainer Management</p>
            <h1>Trainers and members</h1>
          </div>
        </div>

        {message && <p className="info-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="admin-section">
          <h2>Trainer roster</h2>
          {loading ? <p className="empty-state">Loading trainers...</p> : (
            trainers.length ? trainers.map((trainer) => (
              <div key={trainer.id} className="user-item">
                <div>
                  <p>{trainer.firstName} {trainer.lastName}</p>
                  <button type="button" className="link-button" onClick={() => handleViewMembers(trainer)}>
                    {trainer.members.length} assigned members
                  </button>
                </div>
                <button type="button" className="secondary-button" onClick={() => handleSelectTrainer(trainer)}>
                  Add Members
                </button>
              </div>
            )) : <p className="empty-state">No trainers available.</p>
          )}
        </div>

        {selectedTrainer && (
          <div className="admin-section">
            <h2>Add new members to {selectedTrainer.firstName}</h2>
            <p className="info-message">Select members to add. Already assigned members will remain assigned.</p>
            <form className="admin-form" onSubmit={handleAssignSubmit}>
              <label>Select members to add (already assigned members are excluded)</label>
              <select multiple value={selectedMemberIds.map(String)} onChange={(e) => setSelectedMemberIds(Array.from(e.target.selectedOptions).map((option) => Number(option.value)))}>
                {members
                  .filter((member) => !selectedTrainer.members.some((m) => m.id === member.id))
                  .map((member) => (
                    <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>
                  ))}
              </select>
              <div className="admin-form-actions">
                <button type="submit" className="primary-button">Add selected members</button>
                <button type="button" className="secondary-button" onClick={() => setSelectedTrainer(null)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {viewMembersTrainer && (
          <div className="admin-section">
            <h2>Members Assigned to {viewMembersTrainer.firstName} {viewMembersTrainer.lastName}</h2>
            {viewMembersTrainer.members && viewMembersTrainer.members.length > 0 ? (
              <div className="members-table">
                <table>
                  <thead>
                    <tr>
                      <th>Member Name</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewMembersTrainer.members.map((member, index) => (
                      <tr key={index}>
                        <td>{member.firstName} {member.lastName}</td>
                        <td>{member.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-state">No members assigned to this trainer yet.</p>
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

export default AdminTrainerPage;
