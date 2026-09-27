import './About.css'

const milestones = [
  { value: '2025', label: 'Project Inception' },
  { value: '8+', label: 'Core Modules' },
  { value: '6', label: 'AI Features' },
]

function About() {
  return (
    <section id="about" className="section about">
      <div className="about__bg" aria-hidden="true" />
      <div className="container">
        <div className="about__layout">
          <div className="about__visual animate-on-scroll">
            <div className="about__image-card">
              <div className="about__graphic">
                <svg viewBox="0 0 320 280" fill="none">
                  <rect width="320" height="280" rx="16" fill="#E8F2FC" />
                  <rect x="24" y="24" width="272" height="40" rx="8" fill="#FFFFFF" />
                  <rect x="40" y="38" width="60" height="12" rx="4" fill="#0066CC" opacity="0.6" />
                  <rect x="200" y="36" width="80" height="16" rx="6" fill="#0066CC" opacity="0.15" />

                  <rect x="24" y="80" width="128" height="176" rx="10" fill="#FFFFFF" />
                  <circle cx="88" cy="130" r="32" fill="#F0F6FC" />
                  <circle cx="88" cy="120" r="14" fill="#0066CC" opacity="0.5" />
                  <path d="M60 168 Q88 152 116 168" stroke="#0066CC" strokeWidth="3" fill="none" />
                  <rect x="48" y="180" width="80" height="8" rx="3" fill="#CBD5E1" />
                  <rect x="56" y="196" width="64" height="6" rx="2" fill="#E2E8F0" />
                  <rect x="48" y="220" width="80" height="24" rx="6" fill="#0066CC" opacity="0.1" />

                  <rect x="168" y="80" width="128" height="80" rx="10" fill="#FFFFFF" />
                  <rect x="184" y="96" width="48" height="8" rx="3" fill="#0066CC" />
                  <rect x="184" y="116" width="96" height="6" rx="2" fill="#E2E8F0" />
                  <rect x="184" y="130" width="80" height="6" rx="2" fill="#E2E8F0" />
                  <rect x="184" y="144" width="64" height="6" rx="2" fill="#E2E8F0" />

                  <rect x="168" y="176" width="128" height="80" rx="10" fill="#FFFFFF" />
                  <rect x="184" y="192" width="48" height="8" rx="3" fill="#00A4EF" />
                  <rect x="184" y="212" width="40" height="32" rx="4" fill="#0066CC" opacity="0.2" />
                  <rect x="232" y="220" width="40" height="24" rx="4" fill="#00A4EF" opacity="0.25" />
                  <rect x="184" y="252" width="96" height="5" rx="2" fill="#E2E8F0" />
                </svg>
              </div>
            </div>
          </div>

          <div className="about__content animate-on-scroll">
            <span className="section-label">About Empora</span>
            <h2 className="section-title about__title">
              Redefining Employee Self-Service
            </h2>
            <p className="about__text">
              Empora is a platform that envisions a next-generation
              Digital Employee Self-Service (ESS) and Workplace Management Platform.
              It addresses the growing need for organizations to digitize HR operations,
              reduce administrative overhead, and provide employees with seamless
              access to workplace services.
            </p>
            <p className="about__text">
              From attendance tracking and leave management to AI-powered recruitment
              and burnout prediction, Empora integrates every essential workplace
              function into a cohesive, user-friendly platform built with modern
              web technologies.
            </p>

            <div className="about__milestones">
              {milestones.map((item) => (
                <div key={item.label} className="about__milestone">
                  <span className="about__milestone-value">{item.value}</span>
                  <span className="about__milestone-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
