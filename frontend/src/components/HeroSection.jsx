import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-overlay" />
      <div className="hero-copy">
        <span className="eyebrow">Premium Fitness SaaS</span>
        <h1>Build Your Strength, Track Your Progress</h1>
        <p>Modern gym management for members, trainers, and admins. Stay motivated with a powerful workout dashboard and sleek gym analytics.</p>
        <div className="hero-actions">
          <Link to="/register" className="primary-button">Get Started</Link>
          <Link to="/login" className="secondary-button">Login</Link>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
