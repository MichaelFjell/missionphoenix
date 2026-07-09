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

          {/* Fristående statisk sida (utanför SPA-routern) – vanlig länk med avsikt */}
          <a href="/inventory-demo.html">Honesty Inventory</a>

          {/* 1. Added your new Coaching package track */}
          <Link to="/coaching" className={isActive('/coaching') ? 'active' : ''}>Coaching</Link>
          
          {/* 2. Direct external link to Discord */}
          <a href="https://discord.com/invite/tXnBUSbq92" target="_blank" rel="noopener noreferrer">Community</a>
          
          <Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link>
          <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link>
          <Link to="/support" className={isActive('/support') ? 'active' : ''}>Donate</Link>
          
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
