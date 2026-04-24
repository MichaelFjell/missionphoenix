import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './main.jsx';

export default function SiteNav() {
  const { user, profile, signOut } = useAuth() || {};
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (p) => (p === '/' ? pathname === '/' : pathname.startsWith(p));

  const handleLogout = async () => {
    if (signOut) await signOut();
    navigate('/');
  };

  return (
    <nav className="site">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <img src="/phoenix.png" alt="" />
          <span>Mission Phoenix</span>
        </Link>
        <div className="links">
          <Link to="/archive" className={isActive('/archive') ? 'active' : ''}>Archive</Link>
          <Link to="/quiz" className={isActive('/quiz') ? 'active' : ''}>Assessment</Link>
          <Link to="/tracker" className={isActive('/tracker') ? 'active' : ''}>Tracker</Link>
          <Link to="/community" className={isActive('/community') ? 'active' : ''}>Community</Link>
          <Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link>
          <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link>
          <Link to="/support" className={`donate-btn ${isActive('/support') ? 'active' : ''}`}>Donate</Link>
          {user && profile && (
            <span className="user-area">
              <span className="u-name">{profile.username}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
