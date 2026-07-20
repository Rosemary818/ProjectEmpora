import './WhyChoose.css'

const reasons = [
  {
    title: 'Unified Platform',
    description: 'Replace fragmented tools with a single integrated ESS platform covering every aspect of workplace management.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    title: 'Employee-Centric Design',
    description: 'Intuitive self-service portals that empower employees to manage their own HR needs without dependency on admin staff.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    title: 'AI-Driven Insights',
    description: 'Make data-backed HR decisions with predictive analytics, smart automation, and intelligent recommendations.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Enterprise Security',
    description: 'Role-based access control, encrypted data storage, and audit trails to protect sensitive employee information.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Scalable Architecture',
    description: 'Built to grow with your organization — from startups to large enterprises with thousands of employees.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Real-Time Analytics',
    description: 'Interactive dashboards and reports for attendance trends, leave patterns, payroll summaries, and workforce metrics.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
      </svg>
    ),
  },
]

function WhyChoose() {
  return (
    <section id="why-choose" className="section why-choose">
      <div className="container">
        <div className="why-choose__layout">
          <div className="why-choose__intro animate-on-scroll">
            <span className="section-label">Why Empora</span>
            <h2 className="section-title why-choose__title">
              Built for Modern Enterprises
            </h2>
            <p className="why-choose__text">
              Empora bridges the gap between traditional HR systems and the
              demands of a digital-first workforce. Designed with enterprise
              standards, it delivers efficiency, transparency, and intelligence
              at every touchpoint.
            </p>
            <div className="why-choose__highlight">
              <div className="why-choose__highlight-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <strong>Reduce HR workload by up to 60%</strong>
                <p>Through intelligent automation and employee self-service</p>
              </div>
            </div>
          </div>

          <div className="why-choose__grid">
            {reasons.map((reason, index) => (
              <article
                key={reason.title}
                className="why-choose__card animate-on-scroll"
                style={{ transitionDelay: `${index * 0.08}s` }}
              >
                <div className="why-choose__icon">{reason.icon}</div>
                <h3 className="why-choose__card-title">{reason.title}</h3>
                <p className="why-choose__card-text">{reason.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChoose
