import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { validateLoginForm } from '../../utils/validation'
import './Login.css'

const REMEMBER_KEY = 'empora_remember_email'

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" strokeLinecap="round" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" strokeLinecap="round" />
      <path d="M1 1l22 22" strokeLinecap="round" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" strokeLinecap="round" />
    </svg>
  )
}

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotError, setForgotError] = useState('')

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_KEY)
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail }))
      setRememberMe(true)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    const updated = { ...form, [name]: value }
    setForm(updated)

    if (touched[name] || submitted) {
      setErrors(validateLoginForm(updated))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors(validateLoginForm(form))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)

    const validationErrors = validateLoginForm(form)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, form.email.trim())
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }

      alert('Login successful! Welcome back to Empora.')
    }
  }

  const handleForgotSubmit = (e) => {
    e.preventDefault()

    if (!forgotEmail.trim()) {
      setForgotError('Email is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      setForgotError('Enter a valid email address')
      return
    }

    setForgotError('')
    setShowForgotModal(false)
    setForgotEmail('')
    alert('Password reset link has been sent to your email.')
  }

  return (
    <div className="login">
      <div className="login__panel">
        <Link to="/" className="login__brand">
          <span className="login__brand-icon">
            <svg viewBox="0 0 48 32" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="14" r="5" />
              <path d="M3 32 C3 25, 8 22, 12 22 C16 22, 21 25, 21 32 Z" />
              
              <circle cx="36" cy="14" r="5" />
              <path d="M27 32 C27 25, 32 22, 36 22 C40 22, 45 25, 45 32 Z" />
              
              <circle cx="24" cy="11" r="6.5" />
              <path d="M12 32 C12 21, 17 17, 24 17 C31 17, 36 21, 36 32 Z" />
            </svg>
          </span>
          <div className="login__brand-text-group">
            <span className="login__brand-text">EMPORA</span>
            <span className="login__brand-subtext">Work. Connect. Grow.</span>
          </div>
        </Link>

        <div className="login__panel-content">
          <h1>Welcome Back</h1>
          <p>
            Sign in to access your employee dashboard, manage attendance,
            submit leave requests, and more.
          </p>

          <ul className="login__features">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Unified Workplace Dashboard
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" />
              </svg>
              Secure Enterprise Access
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" strokeLinecap="round" />
              </svg>
              AI-Powered HR Assistance
            </li>
          </ul>
        </div>

        <p className="login__panel-footer">
          Workplace Management Platform
        </p>
      </div>

      <div className="login__form-section">
        <div className="login__form-container">
          <div className="login__form-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          <form className="login__form" onSubmit={handleSubmit} noValidate>
            <div className={`login__field ${errors.email ? 'login__field--error' : ''}`}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@company.com"
                autoComplete="email"
              />
              {errors.email && <span className="login__error">{errors.email}</span>}
            </div>

            <div className={`login__field ${errors.password ? 'login__field--error' : ''}`}>
              <label htmlFor="password">Password</label>
              <div className="login__input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login__toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {errors.password && <span className="login__error">{errors.password}</span>}
            </div>

            <div className="login__options">
              <label className="login__checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="login__checkbox-box" />
                <span>Remember Me</span>
              </label>
              <Link
                to="/forgot-password"
                className="login__forgot"
              >
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary login__submit">
              Login
            </button>
          </form>

          <p className="login__register-link">
            Don&apos;t have an account?{' '}
            <Link to="/register">Register</Link>
          </p>
        </div>
      </div>

      {showForgotModal && (
        <div className="login__modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="login__modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="login__modal-close"
              onClick={() => setShowForgotModal(false)}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
            <h3>Reset Password</h3>
            <p>Enter your email address and we&apos;ll send you a link to reset your password.</p>
            <form onSubmit={handleForgotSubmit}>
              <div className={`login__field ${forgotError ? 'login__field--error' : ''}`}>
                <label htmlFor="forgotEmail">Email</label>
                <input
                  type="email"
                  id="forgotEmail"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value)
                    setForgotError('')
                  }}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
                {forgotError && <span className="login__error">{forgotError}</span>}
              </div>
              <button type="submit" className="btn btn-primary login__modal-submit">
                Send Reset Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
