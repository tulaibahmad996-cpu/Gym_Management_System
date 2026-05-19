import { Link } from 'react-router-dom';

function Sidebar({ role }) {
  const normalizedRole = role?.toLowerCase();

  const adminLinks = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Memberships', path: '/admin/memberships' },
    { label: 'Trainers', path: '/admin/trainers' },
    { label: 'Workouts', path: '/admin/workouts' },
    { label: 'Profile', path: '/profile' },
  ];

  const trainerLinks = [
    { label: 'Dashboard', path: '/trainer' },
    { label: 'Workouts', path: '/workouts' },
    { label: 'Profile', path: '/profile' },
  ];

  const memberLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Workouts', path: '/workouts' },
    { label: 'Membership', path: '/membership' },
    { label: 'Profile', path: '/profile' },
  ];

  const links = normalizedRole === 'admin'
    ? adminLinks
    : normalizedRole === 'trainer'
      ? trainerLinks
      : memberLinks;

  const displayRole = role ? `${role.charAt(0).toUpperCase()}${role.slice(1)}` : 'Member';

  return (
    <aside className="sidebar-panel">
      <div className="sidebar-brand">
        <div className="sidebar-avatar">F</div>
        <div>
          <p className="sidebar-title">FitTrack</p>
          <p className="sidebar-subtitle">{displayRole}</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map((item) => (
          <Link key={item.path} to={item.path} className="sidebar-link">{item.label}</Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
