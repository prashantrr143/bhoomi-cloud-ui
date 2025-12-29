import { useNavigate } from 'react-router-dom';
import { BhoomiLogo } from '@/components/common';
import './LandingPage.css';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <a href="/" className="header-logo">
            <BhoomiLogo size={32} />
            <span>Bhoomi Cloud</span>
          </a>
          <div className="header-actions">
            <button className="btn-link" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Create an Account
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="landing-main">
        <div className="hero">
          <h1>Cloud Computing Services</h1>
          <p>
            Bhoomi Cloud provides on-demand cloud computing platforms and APIs
            to individuals, companies, and governments, on a metered, pay-as-you-go basis.
          </p>
          <button className="btn-primary btn-large" onClick={() => navigate('/login')}>
            Get Started for Free
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#">About Bhoomi</a>
            <a href="#">Contact Us</a>
            <a href="#">Careers</a>
          </div>
          <div className="footer-legal">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <span>© 2024, Bhoomi Cloud Technologies Pvt. Ltd.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
