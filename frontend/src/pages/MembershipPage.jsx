import { useEffect, useState } from 'react';
import { getMemberships, subscribeMembership } from '../services/membershipService.js';
import { getMyMembership } from '../services/memberService.js';

function MembershipPage() {
  const [memberships, setMemberships] = useState([]);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemberships();
  }, []);

  const loadMemberships = async () => {
    setLoading(true);
    setError('');
    try {
      const [membershipRes, currentRes] = await Promise.all([
        getMemberships({}),
        getMyMembership(),
      ]);
      setMemberships(membershipRes.data.memberships || []);
      setCurrentMembership(currentRes.data || null);
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (id) => {
    setError('');
    setMessage('');
    try {
      await subscribeMembership(id);
      setMessage('Subscribed successfully.');
      await loadMemberships();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to subscribe to membership');
    }
  };

  const activeMembershipId = currentMembership?.membership?.id;

  return (
    <section className="dashboard-card page-block">
      <div className="page-header">
        <div>
          <p className="eyebrow">Memberships</p>
          <h1>Select your plan</h1>
        </div>
      </div>

      {message && <p className="info-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p className="empty-state">Loading membership plans...</p>
      ) : (
        <>
          <div className="member-panel">
            {activeMembershipId ? (
              <>
                <h3>Current plan</h3>
                <p>{currentMembership.membership.title}</p>
                <p>Status: {currentMembership.status}</p>
                <p>Valid: {currentMembership.startDate || 'N/A'} — {currentMembership.endDate || 'N/A'}</p>
              </>
            ) : (
              <p>You do not have an active membership plan.</p>
            )}
          </div>

          <div className="membership-grid">
            {memberships.length ? (
              memberships.map((membership) => {
                const isActive = membership.id === activeMembershipId;
                const buttonLabel = isActive ? 'Current plan' : activeMembershipId ? 'Already subscribed' : 'Subscribe';
                return (
                  <article className="membership-card" key={membership.id}>
                    <h3>{membership.title}</h3>
                    <p>{membership.description || 'No description available.'}</p>
                    <p>Price: ${membership.price}</p>
                    <p>{membership.duration ? `${membership.duration} duration` : 'Flexible duration'}</p>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => handleSubscribe(membership.id)}
                      disabled={activeMembershipId && !isActive}
                    >
                      {buttonLabel}
                    </button>
                  </article>
                );
              })
            ) : (
              <p className="empty-state">No membership plans available.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default MembershipPage;
