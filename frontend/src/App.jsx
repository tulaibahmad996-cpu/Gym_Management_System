import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminMembershipPage from './pages/AdminMembershipPage.jsx';
import AdminTrainerPage from './pages/AdminTrainerPage.jsx';
import AdminWorkoutPage from './pages/AdminWorkoutPage.jsx';
import MemberDashboard from './pages/MemberDashboard.jsx';
import TrainerDashboard from './pages/TrainerDashboard.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import WorkoutsPage from './pages/WorkoutsPage.jsx';
import MembershipPage from './pages/MembershipPage.jsx';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/memberships" element={<ProtectedRoute role="admin"><AdminMembershipPage /></ProtectedRoute>} />
          <Route path="/admin/trainers" element={<ProtectedRoute role="admin"><AdminTrainerPage /></ProtectedRoute>} />
          <Route path="/admin/workouts" element={<ProtectedRoute role="admin"><AdminWorkoutPage /></ProtectedRoute>} />
          <Route path="/trainer" element={<ProtectedRoute role="trainer"><TrainerDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/workouts" element={<ProtectedRoute><WorkoutsPage /></ProtectedRoute>} />
          <Route path="/membership" element={<ProtectedRoute><MembershipPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
