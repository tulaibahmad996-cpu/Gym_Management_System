import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const normalizedRole = role?.toLowerCase();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" className="brand-link">FitTrack</Link>
      </div>
      <div className="nav-menu">
        <Link to="/">Home</Link>
        {token && <Link to={normalizedRole === 'admin' ? '/admin' : normalizedRole === 'trainer' ? '/trainer' : '/dashboard'}>Dashboard</Link>}
        {token && <Link to="/workouts">Workouts</Link>}
        {token && normalizedRole !== 'trainer' && <Link to="/membership">Membership</Link>}
        {token && <Link to="/profile">Profile</Link>}
      </div>
      <div className="nav-actions">
        {token ? (
          <button className="nav-logout" onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login" className="nav-button">Login</Link>
            <Link to="/register" className="nav-button nav-button-secondary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
