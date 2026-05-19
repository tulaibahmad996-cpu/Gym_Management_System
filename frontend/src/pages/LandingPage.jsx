import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection.jsx';
import Footer from '../components/Footer.jsx';
import api from '../services/api.js';

function LandingPage() {
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = Boolean(localStorage.getItem('token'));
  const subscribePath = isAuthenticated ? '/membership' : '/login';
  const subscribeLabel = isAuthenticated ? 'Subscribe Now' : 'Login to Subscribe';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansRes, trainersRes] = await Promise.all([
        api.get('/memberships/public/list'),
        api.get('/users/public/trainers')
      ]);

      setPlans(plansRes.data.memberships || plansRes.data || []);
      setTrainers(trainersRes.data.users || trainersRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrainerImage = (trainer) => {
    if (trainer.profileImage) {
      return trainer.profileImage;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${trainer.firstName}${trainer.lastName}`;
  };

  return (
    <div className="landing-page">
      <HeroSection />

      {/* MEMBERSHIP PLANS SECTION */}
      <section className="plans-section">
        <div className="section-header">
          <p className="eyebrow">Membership Plans</p>
          <h2>Choose your fitness membership</h2>
          <p className="section-copy">
            Select a plan that aligns with your fitness goals and get started with personalized workouts and trainer support.
          </p>
        </div>

        <div className="plan-grid">
          {loading ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#475569' }}>Loading membership plans...</p>
          ) : plans.length > 0 ? (
            plans.map((plan) => (
              <article key={plan.id} className="plan-card">
                <div className="plan-card-badge">{plan.duration || 'Membership'}</div>
                <div className="plan-card-top">
                  <h3>{plan.title}</h3>
                  <span className="plan-price">${plan.price}</span>
                </div>
                <p className="plan-description">{plan.description || 'Premium membership access'}</p>
                <div className="plan-features">
                  <div className="plan-feature">✓ Access to workout plans</div>
                  <div className="plan-feature">✓ Trainer support</div>
                  <div className="plan-feature">✓ Progress tracking</div>
                </div>
                <Link to={subscribePath} className="plan-button">
                  {subscribeLabel}
                </Link>
              </article>
            ))
          ) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#475569' }}>No membership plans available</p>
          )}
        </div>
      </section>

      {/* TRAINERS SECTION */}
      <section className="trainers-section">
        <div className="section-header">
          <p className="eyebrow">Professional Trainers</p>
          <h2>Meet our expert coaching team</h2>
          <p className="section-copy">
            Our certified trainers are dedicated to helping you achieve your fitness goals with personalized guidance and support.
          </p>
        </div>

        <div className="trainer-grid">
          {loading ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#475569' }}>Loading trainers...</p>
          ) : trainers.length > 0 ? (
            trainers.map((trainer) => (
              <article key={trainer.id} className="trainer-card">
                <div className="trainer-image-wrapper">
                  <img
                    src={getTrainerImage(trainer)}
                    alt={`${trainer.firstName} ${trainer.lastName}`}
                    className="trainer-image"
                  />
                </div>
                <div className="trainer-body">
                  <h3>{trainer.firstName} {trainer.lastName}</h3>
                  <p className="trainer-role">Certified Fitness Trainer</p>
                  <p className="trainer-bio">Dedicated to delivering personalized fitness solutions and helping members reach their goals.</p>
                </div>
              </article>
            ))
          ) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#475569' }}>No trainers available</p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
