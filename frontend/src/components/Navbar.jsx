import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">TaskFlow</Link>
      <div className="navbar-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Dashboard</Link>
        <Link to="/projects" className={`nav-link ${location.pathname.startsWith('/projects') ? 'active' : ''}`}>Projects</Link>
      </div>
      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-avatar">{user.name?.charAt(0).toUpperCase()}</div>
          <span>{user.name}</span>
        </div>
        <button className="navbar-logout" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
