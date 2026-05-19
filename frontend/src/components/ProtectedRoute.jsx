import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole?.toLowerCase() !== role?.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
