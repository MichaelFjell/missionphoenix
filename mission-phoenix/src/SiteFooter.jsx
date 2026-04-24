import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="site">
      <div className="foot-inner">
        <div className="foot-col">
          <div className="foot-brand">
            <img src="/phoenix.png" alt="" />
            <span>Mission Phoenix</span>
          </div>
          <p>A community and life mission to spread awareness of the real cost of pornography.</p>
        </div>
        <div className="foot-col">
          <h4>The work</h4>
          <Link to="/quiz">Self-assessment</Link>
          <Link to="/tracker">Recovery tracker</Link>
          <Link to="/community">Community</Link>
          <Link to="/archive">Newsletter archive</Link>
        </div>
        <div className="foot-col">
          <h4>The mission</h4>
          <Link to="/about">About Michael</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/support">Donate</Link>
        </div>
        <div className="foot-col">
          <h4>Account</h4>
          <Link to="/tracker">Log in</Link>
          <Link to="/tracker">Create account</Link>
          <Link to="/contact">Get help</Link>
        </div>
      </div>
      <div className="foot-bottom">
        <span>© 2026 Mission Phoenix</span>
      </div>
    </footer>
  );
}
