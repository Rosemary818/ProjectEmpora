import './AIFeatures.css'

const aiFeatures = [
  {
    title: 'AI HR Assistant',
    description: 'An intelligent virtual assistant that answers HR queries, guides policy lookups, and automates routine employee requests 24/7.',
    tag: 'Conversational AI',
  },
  {
    title: 'AI Resume Screening',
    description: 'Automatically parse and rank candidate resumes against job requirements, reducing manual screening time significantly.',
    tag: 'Recruitment',
  },
  {
    title: 'AI Interview Assistant',
    description: 'Generate structured interview questions, evaluate responses, and provide bias-free candidate assessment insights.',
    tag: 'Hiring',
  },
  {
    title: 'AI Meeting Hub',
    description: 'Smart meeting summaries, action item extraction, and automated follow-ups to boost team productivity.',
    tag: 'Productivity',
  },
  {
    title: 'AI Shadow Profile',
    description: 'Build comprehensive employee skill profiles from work patterns, enabling better role matching and talent mobility.',
    tag: 'Talent Intelligence',
  },
  {
    title: 'Employee Burnout Prediction',
    description: 'Analyze workload, attendance, and engagement signals to proactively identify and prevent employee burnout.',
    tag: 'Wellness',
  },
]

function AIFeatures() {
  return (
    <section id="ai-features" className="section ai-features">
      <div className="ai-features__bg" aria-hidden="true" />
      <div className="container">
        <div className="section-header animate-on-scroll">
          <span className="section-label">AI-Powered</span>
          <h2 className="section-title">Intelligent Workforce Solutions</h2>
          <p className="section-subtitle">
            Leverage cutting-edge artificial intelligence to transform HR processes,
            enhance decision-making, and create a smarter workplace.
          </p>
        </div>

        <div className="ai-features__grid">
          {aiFeatures.map((feature, index) => (
            <article
              key={feature.title}
              className="ai-features__card animate-on-scroll"
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="ai-features__card-header">
                <div className="ai-features__spark">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
                  </svg>
                </div>
                <span className="ai-features__tag">{feature.tag}</span>
              </div>
              <h3 className="ai-features__title">{feature.title}</h3>
              <p className="ai-features__description">{feature.description}</p>
              <div className="ai-features__glow" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AIFeatures
