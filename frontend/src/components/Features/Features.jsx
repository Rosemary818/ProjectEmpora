import './Features.css'

const features = [
  {
    title: 'Employee Management',
    description: 'Centralize employee profiles, roles, departments, and organizational hierarchy in one unified system.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Attendance',
    description: 'Track check-ins, work hours, and shift schedules with real-time visibility and automated reporting.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Leave Management',
    description: 'Streamline leave requests, approvals, balance tracking, and policy enforcement effortlessly.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'Payroll',
    description: 'Automate salary processing, tax deductions, payslip generation, and compliance with accuracy.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M6 10h.01M18 10h.01" strokeLinecap="round" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'Project Management',
    description: 'Plan, assign, and monitor projects with milestones, task boards, and team collaboration tools.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeLinecap="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Timesheet',
    description: 'Log billable and non-billable hours with project-wise breakdowns and manager approval workflows.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Document Management',
    description: 'Securely store, share, and manage HR documents, contracts, and company policies in the cloud.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" strokeLinecap="round" />
        <path d="M12 11v6M9 14h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Career Portal',
    description: 'Empower employees with growth paths, skill development, internal job postings, and career planning.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" strokeLinecap="round" />
      </svg>
    ),
  },
]

function Features() {
  return (
    <section id="features" className="section features">
      <div className="container">
        <div className="section-header animate-on-scroll">
          <span className="section-label">Core Features</span>
          <h2 className="section-title">Everything Your Workplace Needs</h2>
          <p className="section-subtitle">
            A comprehensive suite of modules designed to simplify HR operations
            and empower employees with self-service capabilities.
          </p>
        </div>

        <div className="features__grid">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="features__card animate-on-scroll"
              style={{ transitionDelay: `${index * 0.08}s` }}
            >
              <div className="features__icon">{feature.icon}</div>
              <h3 className="features__title">{feature.title}</h3>
              <p className="features__description">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
