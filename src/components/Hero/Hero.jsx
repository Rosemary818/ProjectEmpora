import { Link } from 'react-router-dom'
import './Hero.css'

function WorkplaceIllustration() {
  return (
    <div className="hero__illustration" aria-hidden="true">
      <svg viewBox="0 0 560 420" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="40" y="60" width="480" height="320" rx="16" fill="#badfe7" />
        <rect x="60" y="80" width="440" height="48" rx="8" fill="#ffffff" />
        <circle cx="84" cy="104" r="10" fill="#388087" />
        <rect x="104" y="98" width="80" height="12" rx="4" fill="#6fb3b8" />
        <rect x="380" y="94" width="100" height="20" rx="6" fill="#388087" opacity="0.15" />

        <rect x="60" y="144" width="200" height="216" rx="10" fill="#ffffff" />
        <rect x="76" y="160" width="80" height="8" rx="3" fill="#388087" />
        <rect x="76" y="178" width="168" height="6" rx="2" fill="#c2edce" />
        <rect x="76" y="192" width="140" height="6" rx="2" fill="#c2edce" />

        <rect x="76" y="220" width="168" height="56" rx="8" fill="#f6f6f2" />
        <rect x="88" y="232" width="60" height="32" rx="4" fill="#388087" opacity="0.2" />
        <rect x="156" y="236" width="76" height="6" rx="2" fill="#6fb3b8" />
        <rect x="156" y="248" width="56" height="6" rx="2" fill="#badfe7" />

        <rect x="76" y="292" width="168" height="56" rx="8" fill="#f6f6f2" />
        <rect x="88" y="304" width="60" height="32" rx="4" fill="#c2edce" opacity="0.5" />
        <rect x="156" y="308" width="76" height="6" rx="2" fill="#6fb3b8" />
        <rect x="156" y="320" width="56" height="6" rx="2" fill="#badfe7" />

        <rect x="276" y="144" width="224" height="100" rx="10" fill="#ffffff" />
        <rect x="292" y="160" width="60" height="8" rx="3" fill="#388087" />
        <path d="M292 188 L312 210 L352 170 L392 200 L452 150" stroke="#388087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="312" cy="210" r="4" fill="#388087" />
        <circle cx="352" cy="170" r="4" fill="#c2edce" />
        <circle cx="392" cy="200" r="4" fill="#388087" />
        <circle cx="452" cy="150" r="4" fill="#c2edce" />

        <rect x="276" y="260" width="104" height="100" rx="10" fill="#ffffff" />
        <circle cx="328" cy="296" r="24" fill="#badfe7" />
        <circle cx="328" cy="288" r="10" fill="#388087" opacity="0.6" />
        <path d="M308 320 Q328 308 348 320" stroke="#388087" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="292" y="332" width="72" height="6" rx="2" fill="#6fb3b8" />
        <rect x="304" y="344" width="48" height="5" rx="2" fill="#badfe7" />

        <rect x="396" y="260" width="104" height="100" rx="10" fill="#ffffff" />
        <rect x="412" y="276" width="72" height="6" rx="2" fill="#388087" opacity="0.5" />
        <rect x="412" y="292" width="56" height="40" rx="6" fill="#f6f6f2" />
        <rect x="420" y="300" width="16" height="24" rx="2" fill="#388087" opacity="0.3" />
        <rect x="440" y="308" width="16" height="16" rx="2" fill="#c2edce" opacity="0.8" />
        <rect x="460" y="296" width="16" height="28" rx="2" fill="#388087" opacity="0.5" />
        <rect x="412" y="342" width="72" height="5" rx="2" fill="#badfe7" />

        <circle cx="500" cy="80" r="28" fill="#388087" opacity="0.15" />
        <circle cx="60" cy="340" r="20" fill="#c2edce" opacity="0.4" />
      </svg>

    </div>
  )
}

function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero__bg-pattern" aria-hidden="true" />
      <div className="container hero__container">
        <div className="hero__content">
          <div className="hero__badge animate-on-scroll">
            <span className="hero__badge-dot" />
            Enterprise Workplace Platform
          </div>
          <h1 className="hero__title animate-on-scroll">
            <span className="hero__title-highlight">Empora</span> Workspace
          </h1>
          <p className="hero__subtitle animate-on-scroll">
            A Digital Employee Self-Service and Workplace Management Platform.
          </p>
          <div className="hero__actions animate-on-scroll">
            <Link to="/register" className="btn btn-primary hero__btn">
              Get Started
            </Link>
            <a href="#features" className="btn btn-secondary hero__btn">
              Explore Features
            </a>
            <Link to="/candidate-register" className="btn btn-secondary hero__btn">
              Career Portal
            </Link>
          </div>
          <div className="hero__stats animate-on-scroll">
            <div className="hero__stat">
              <span className="hero__stat-value">8+</span>
              <span className="hero__stat-label">Core Modules</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">6</span>
              <span className="hero__stat-label">AI Capabilities</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">100%</span>
              <span className="hero__stat-label">Cloud Ready</span>
            </div>
          </div>
        </div>
        <div className="hero__visual animate-on-scroll">
          <WorkplaceIllustration />
        </div>
      </div>
    </section>
  )
}

export default Hero
