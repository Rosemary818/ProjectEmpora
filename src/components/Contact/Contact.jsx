import { useState } from 'react'
import './Contact.css'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    message: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Thank you for your interest in Empora! We will get back to you soon.')
    setFormData({ name: '', email: '', organization: '', message: '' })
  }

  return (
    <section id="contact" className="section contact">
      <div className="container">
        <div className="section-header animate-on-scroll">
          <span className="section-label">Contact Us</span>
          <h2 className="section-title">Get in Touch</h2>
          <p className="section-subtitle">
            Have questions about Empora or want to learn more? Reach out to us
            and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="contact__layout">
          <div className="contact__info animate-on-scroll">
            <div className="contact__info-card">
              <div className="contact__info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" />
                  <path d="M22 6l-10 7L2 6" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3>Email</h3>
                <p>contact@empora.com</p>
              </div>
            </div>

            <div className="contact__info-card">
              <div className="contact__info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3>Phone</h3>
                <p>+91 98765 43210</p>
              </div>
            </div>

            <div className="contact__info-card">
              <div className="contact__info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <h3>Location</h3>
                <p>India</p>
              </div>
            </div>

            <div className="contact__cta-box">
              <h3>Ready to transform your workplace?</h3>
              <p>Start your journey with Empora today and experience the future of employee self-service.</p>
              <a href="#home" className="btn btn-primary">Get Started</a>
            </div>
          </div>

          <form className="contact__form animate-on-scroll" onSubmit={handleSubmit}>
            <div className="contact__form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="contact__form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="contact__form-group">
              <label htmlFor="organization">Organization</label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="Your company or institution"
              />
            </div>

            <div className="contact__form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                rows="5"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary contact__submit">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Contact
