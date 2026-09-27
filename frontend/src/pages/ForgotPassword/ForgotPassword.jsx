import { useState } from 'react'
import { Link } from 'react-router-dom'
import './ForgotPassword.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Email is required')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      
      if (response.ok) {
        sessionStorage.setItem('resetEmail', email);
        setError('');
        setSubmitted(true);
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    }
  }

  return (
    <div className="forgot">
      <div className="forgot__panel">
        <Link to="/" className="forgot__brand">
          <span className="forgot__brand-icon">
            <svg viewBox="0 0 48 32" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="14" r="5" />
              <path d="M3 32 C3 25, 8 22, 12 22 C16 22, 21 25, 21 32 Z" />

              <circle cx="36" cy="14" r="5" />
              <path d="M27 32 C27 25, 32 22, 36 22 C40 22, 45 25, 45 32 Z" />

              <circle cx="24" cy="11" r="6.5" />
              <path d="M12 32 C12 21, 17 17, 24 17 C31 17, 36 21, 36 32 Z" />
            </svg>
          </span>
          <div className="forgot__brand-text-group">
            <span className="forgot__brand-text">EMPORA</span>
            <span className="forgot__brand-subtext">Work. Connect. Grow.</span>
          </div>
        </Link>

        <div className="forgot__panel-content">
          <h1>Password Reset</h1>
          <p>
            Enter your email address and we'll send you a One-Time Password (OTP) to reset your password.
          </p>
        </div>

        <p className="forgot__panel-footer">
          Workplace Management Platform
        </p>
      </div>

      <div className="forgot__form-section">
        <div className="forgot__form-container">
          <div className="forgot__form-header">
            <h2>Forgot Password?</h2>
            <p>No worries, we'll send you reset instructions.</p>
          </div>

          {submitted ? (
            <div className="forgot__success">
              <div className="forgot__success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Check your email</h3>
              <p>We sent an OTP to <strong>{email}</strong></p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
                <Link to="/verify-otp" className="btn-primary" style={{ padding: '14px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'block', textAlign: 'center' }}>
                  Enter Verification Code
                </Link>
                <button
                  className="btn-secondary forgot__btn-resend"
                  onClick={() => setSubmitted(false)}
                >
                  Use a different email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="forgot__form" noValidate>
              <div className={`forgot__field ${error ? 'forgot__field--error' : ''}`}>
                <label htmlFor="email">Work Email</label>
                <div className="forgot__input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" />
                    <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError('')
                    }}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
                {error && <span className="forgot__error">{error}</span>}
              </div>

              <button type="submit" className="btn-primary forgot__btn-submit">
                Send OTP
              </button>
            </form>
          )}

          <div className="forgot__form-footer">
            <Link to="/login" className="forgot__login-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
