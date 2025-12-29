import { useNavigate } from 'react-router-dom';
import { BhoomiLogo } from '@/components/common';
import './LandingPage.css';

const services = [
  {
    icon: '⚡',
    title: 'Compute',
    description: 'Scalable virtual machines, containers, and serverless computing',
    features: ['EC2 Instances', 'Lambda Functions', 'ECS & EKS'],
  },
  {
    icon: '🗄️',
    title: 'Storage',
    description: 'Secure, durable, and highly available storage solutions',
    features: ['S3 Object Storage', 'EBS Volumes', 'Glacier Archive'],
  },
  {
    icon: '🌐',
    title: 'Networking',
    description: 'Build secure and isolated cloud networks',
    features: ['VPC', 'Load Balancers', 'Route 53 DNS'],
  },
  {
    icon: '🔐',
    title: 'Security & IAM',
    description: 'Identity management and security controls',
    features: ['IAM Policies', 'Security Groups', 'KMS Encryption'],
  },
  {
    icon: '📊',
    title: 'Monitoring',
    description: 'Real-time visibility into your infrastructure',
    features: ['CloudWatch Metrics', 'Alarms', 'Log Analytics'],
  },
  {
    icon: '💰',
    title: 'Cost Management',
    description: 'Optimize spending with detailed billing insights',
    features: ['Cost Explorer', 'Budgets', 'Usage Reports'],
  },
];

const stats = [
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '25+', label: 'Availability Zones' },
  { value: '200+', label: 'Services' },
  { value: '1M+', label: 'Active Customers' },
];

const useCases = [
  {
    title: 'Web Applications',
    description: 'Host scalable websites and web apps with auto-scaling and global CDN.',
    icon: '🖥️',
  },
  {
    title: 'Data Analytics',
    description: 'Process petabytes of data with managed analytics services.',
    icon: '📈',
  },
  {
    title: 'Machine Learning',
    description: 'Build, train, and deploy ML models at scale.',
    icon: '🤖',
  },
  {
    title: 'DevOps & CI/CD',
    description: 'Automate your software delivery pipeline.',
    icon: '🔄',
  },
];

const testimonials = [
  {
    quote: 'Bhoomi Cloud helped us reduce infrastructure costs by 40% while improving performance.',
    author: 'Rajesh Kumar',
    role: 'CTO, TechStart India',
  },
  {
    quote: 'The multi-tenant architecture made it easy to manage our enterprise clients.',
    author: 'Priya Sharma',
    role: 'VP Engineering, DataFlow',
  },
  {
    quote: 'Exceptional support and documentation. Migration was seamless.',
    author: 'Amit Patel',
    role: 'DevOps Lead, FinServe',
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <a href="/" className="header-logo">
            <BhoomiLogo size={36} />
            <span>Bhoomi Cloud</span>
          </a>
          <nav className="header-nav">
            <a href="#services">Services</a>
            <a href="#solutions">Solutions</a>
            <a href="#pricing">Pricing</a>
            <a href="#docs">Documentation</a>
          </nav>
          <div className="header-actions">
            <button className="btn-link" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Create Free Account
            </button>
          </div>
          <button className="mobile-menu-btn" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-grid"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">India's Cloud Platform</div>
          <h1>Build the Future with <span className="gradient-text">Bhoomi Cloud</span></h1>
          <p>
            Enterprise-grade cloud infrastructure designed for Indian businesses.
            Secure, scalable, and compliant with local data regulations.
          </p>
          <div className="hero-cta">
            <button className="btn-primary btn-large" onClick={() => navigate('/login')}>
              Start Free Trial
            </button>
            <button className="btn-secondary btn-large" onClick={() => navigate('/login')}>
              Contact Sales
            </button>
          </div>
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" id="services">
        <div className="section-container">
          <div className="section-header">
            <h2>Cloud Services</h2>
            <p>Everything you need to build, deploy, and scale your applications</p>
          </div>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <a href="#" className="service-link">Learn more →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="features-section">
        <div className="section-container">
          <div className="features-content">
            <div className="features-text">
              <h2>Why Choose Bhoomi Cloud?</h2>
              <div className="feature-item">
                <div className="feature-icon">🇮🇳</div>
                <div>
                  <h4>Data Sovereignty</h4>
                  <p>Your data stays in India. Fully compliant with local regulations and data protection laws.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <div>
                  <h4>Low Latency</h4>
                  <p>Multiple data centers across India ensure minimal latency for your users.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💵</div>
                <div>
                  <h4>Cost Effective</h4>
                  <p>Pay only for what you use. No hidden fees, transparent pricing in INR.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🛡️</div>
                <div>
                  <h4>Enterprise Security</h4>
                  <p>ISO 27001, SOC 2 certified. End-to-end encryption and advanced threat protection.</p>
                </div>
              </div>
            </div>
            <div className="features-visual">
              <div className="console-preview">
                <div className="console-header">
                  <div className="console-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>Bhoomi Cloud Console</span>
                </div>
                <div className="console-body">
                  <div className="console-sidebar"></div>
                  <div className="console-main">
                    <div className="console-card"></div>
                    <div className="console-card"></div>
                    <div className="console-card small"></div>
                    <div className="console-card small"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="usecases-section" id="solutions">
        <div className="section-container">
          <div className="section-header">
            <h2>Built for Every Workload</h2>
            <p>From startups to enterprises, power your applications with Bhoomi Cloud</p>
          </div>
          <div className="usecases-grid">
            {useCases.map((useCase, index) => (
              <div key={index} className="usecase-card">
                <div className="usecase-icon">{useCase.icon}</div>
                <h3>{useCase.title}</h3>
                <p>{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Trusted by Industry Leaders</h2>
            <p>See what our customers have to say</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-quote">"{testimonial.quote}"</div>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.author[0]}</div>
                  <div>
                    <div className="author-name">{testimonial.author}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="pricing-section" id="pricing">
        <div className="section-container">
          <div className="section-header">
            <h2>Simple, Transparent Pricing</h2>
            <p>No hidden fees. Pay only for what you use.</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-tier">Free Tier</div>
              <div className="pricing-price">₹0<span>/month</span></div>
              <p>Perfect for learning and small projects</p>
              <ul className="pricing-features">
                <li>750 hours t2.micro instances</li>
                <li>5 GB S3 storage</li>
                <li>1 million Lambda requests</li>
                <li>Community support</li>
              </ul>
              <button className="btn-secondary" onClick={() => navigate('/login')}>Get Started</button>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-tier">Pay As You Go</div>
              <div className="pricing-price">Usage<span> based</span></div>
              <p>For production workloads</p>
              <ul className="pricing-features">
                <li>All instance types available</li>
                <li>Unlimited storage</li>
                <li>All services included</li>
                <li>24/7 technical support</li>
              </ul>
              <button className="btn-primary" onClick={() => navigate('/login')}>Start Free Trial</button>
            </div>
            <div className="pricing-card">
              <div className="pricing-tier">Enterprise</div>
              <div className="pricing-price">Custom</div>
              <p>For large organizations</p>
              <ul className="pricing-features">
                <li>Volume discounts</li>
                <li>Dedicated support</li>
                <li>Custom SLAs</li>
                <li>On-premise hybrid</li>
              </ul>
              <button className="btn-secondary">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Create your free account today and get ₹10,000 in credits</p>
            <div className="cta-buttons">
              <button className="btn-primary btn-large" onClick={() => navigate('/login')}>
                Create Free Account
              </button>
              <button className="btn-outline btn-large">
                Talk to an Expert
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-main">
          <div className="section-container">
            <div className="footer-grid">
              <div className="footer-brand">
                <div className="footer-logo">
                  <BhoomiLogo size={32} />
                  <span>Bhoomi Cloud</span>
                </div>
                <p>India's trusted cloud platform for businesses of all sizes.</p>
                <div className="social-links">
                  <a href="#" aria-label="Twitter">𝕏</a>
                  <a href="#" aria-label="LinkedIn">in</a>
                  <a href="#" aria-label="GitHub">⌘</a>
                  <a href="#" aria-label="YouTube">▶</a>
                </div>
              </div>
              <div className="footer-links-group">
                <h4>Products</h4>
                <a href="#">Compute</a>
                <a href="#">Storage</a>
                <a href="#">Networking</a>
                <a href="#">Database</a>
                <a href="#">Analytics</a>
              </div>
              <div className="footer-links-group">
                <h4>Solutions</h4>
                <a href="#">Startups</a>
                <a href="#">Enterprise</a>
                <a href="#">Government</a>
                <a href="#">Education</a>
                <a href="#">Healthcare</a>
              </div>
              <div className="footer-links-group">
                <h4>Resources</h4>
                <a href="#" id="docs">Documentation</a>
                <a href="#">Tutorials</a>
                <a href="#">Blog</a>
                <a href="#">Case Studies</a>
                <a href="#">Webinars</a>
              </div>
              <div className="footer-links-group">
                <h4>Company</h4>
                <a href="#">About Us</a>
                <a href="#">Careers</a>
                <a href="#">Press</a>
                <a href="#">Partners</a>
                <a href="#">Contact</a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="section-container">
            <div className="footer-bottom-content">
              <div className="footer-legal">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
                <a href="#">Compliance</a>
              </div>
              <div className="footer-copyright">
                © 2025 Bhoomi Cloud Technologies Pvt. Ltd. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
