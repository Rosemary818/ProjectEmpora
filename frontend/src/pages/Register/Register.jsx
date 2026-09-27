import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { getPasswordStrength, validateRegisterForm } from '../../utils/validation'
import './Register.css'

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
}

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

function PasswordField({
  id,
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  show,
  onToggle,
  placeholder,
}) {
  return (
    <div className={`register__field ${error ? 'register__field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="register__input-wrap">
        <input
          type={show ? 'text' : 'password'}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={name === 'password' ? 'new-password' : 'new-password'}
        />
        <button
          type="button"
          className="register__toggle-pw"
          onClick={onToggle}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          <EyeIcon open={show} />
        </button>
      </div>
      {error && <span className="register__error">{error}</span>}
    </div>
  )
}

function PasswordStrength({ password }) {
  const { score, label, checks } = getPasswordStrength(password)

  if (!password) return null

  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e']

  return (
    <div className="register__strength">
      <div className="register__strength-bars">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="register__strength-bar"
            style={{
              background: score >= level ? colors[score] : 'var(--gray-200)',
            }}
          />
        ))}
      </div>
      <span
        className="register__strength-label"
        style={{ color: colors[score] }}
      >
        {label}
      </span>
      <ul className="register__strength-checks">
        {checks.map((check) => (
          <li key={check.label} className={check.met ? 'met' : ''}>
            <svg viewBox="0 0 16 16" fill="currentColor">
              {check.met ? (
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
              ) : (
                <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
              )}
            </svg>
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Register() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const updated = { ...form, [name]: type === 'checkbox' ? checked : value }
    setForm(updated)

    if (touched[name] || submitted) {
      setErrors(validateRegisterForm(updated))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors(validateRegisterForm(form))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)

    const validationErrors = validateRegisterForm(form)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            password: form.password,
          })
        });
        const data = await response.json();
        
        if (response.ok) {
          alert('Registration successful! Welcome to Empora. ' + (data.message || ''));
          setForm(initialForm)
          setTouched({})
          setSubmitted(false)
          setErrors({})
          navigate('/login');
        } else {
          alert(data.message || data.error || 'Registration failed');
        }
      } catch (err) {
        alert('An error occurred during registration. Please try again.');
        console.error(err);
      }
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await response.json();

      if (response.ok) {
        if (data.data?.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken);
        }
        if (data.data?.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        
        // Always redirect Google signups to Candidate Dashboard per prompt, unless they already exist as another role
        if (data.data?.user?.role === 'SuperAdmin') {
          navigate('/super-admin/dashboard');
        } else if (data.data?.user?.role === 'HRAdmin') {
          navigate('/hr/dashboard');
        } else if (data.data?.user?.role === 'Manager') {
          navigate('/manager/dashboard');
        } else if (data.data?.user?.role === 'Employee') {
          navigate('/employee/dashboard');
        } else {
          navigate('/career-portal/dashboard');
        }
      } else {
        alert(data.message || data.error || 'Google signup failed');
      }
    } catch (err) {
      alert('An error occurred during Google signup. Please try again.');
      console.error(err);
    }
  };

  const handleGoogleError = () => {
    alert('Google authentication failed. Please try again.');
  };

  return (
    <div className="register">
      <div className="register__panel">
        <Link to="/" className="register__brand">
          <span className="register__brand-icon">
            <svg viewBox="0 0 48 32" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="14" r="5" />
              <path d="M3 32 C3 25, 8 22, 12 22 C16 22, 21 25, 21 32 Z" />
              
              <circle cx="36" cy="14" r="5" />
              <path d="M27 32 C27 25, 32 22, 36 22 C40 22, 45 25, 45 32 Z" />
              
              <circle cx="24" cy="11" r="6.5" />
              <path d="M12 32 C12 21, 17 17, 24 17 C31 17, 36 21, 36 32 Z" />
            </svg>
          </span>
          <div className="register__brand-text-group">
            <span className="register__brand-text">EMPORA</span>
            <span className="register__brand-subtext">Work. Connect. Grow.</span>
          </div>
        </Link>

        <div className="register__panel-content">
          <h1>Join Empora</h1>
          <p>
            Create your account and unlock a smarter way to manage your
            workplace — from attendance to AI-powered HR assistance.
          </p>

          <ul className="register__benefits">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              Employee Self-Service Portal
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              AI-Powered HR Tools
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              Secure & Enterprise-Ready
            </li>
          </ul>
        </div>

        <p className="register__panel-footer">
          Workplace Management Platform
        </p>
      </div>

      <div className="register__form-section">
        <div className="register__form-container">
          <div className="register__form-header">
            <h2>Create Account</h2>
            <p>Fill in your details to get started with Empora</p>
          </div>

          <form className="register__form" onSubmit={handleSubmit} noValidate>
            <div className="register__row">
              <div className={`register__field ${errors.firstName ? 'register__field--error' : ''}`}>
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="given-name"
                />
                {errors.firstName && <span className="register__error">{errors.firstName}</span>}
              </div>

              <div className={`register__field ${errors.lastName ? 'register__field--error' : ''}`}>
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}

                  autoComplete="family-name"
                />
                {errors.lastName && <span className="register__error">{errors.lastName}</span>}
              </div>
            </div>

            <div className={`register__field ${errors.email ? 'register__field--error' : ''}`}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}

                autoComplete="email"
              />
              {errors.email && <span className="register__error">{errors.email}</span>}
            </div>

            <div className={`register__field ${errors.phone ? 'register__field--error' : ''}`}>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                onBlur={handleBlur}

                autoComplete="tel"
              />
              {errors.phone && <span className="register__error">{errors.phone}</span>}
            </div>

            <PasswordField
              id="password"
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              show={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
              placeholder="Create a strong password"
            />
            <PasswordStrength password={form.password} />

            <PasswordField
              id="confirmPassword"
              label="Confirm Password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              placeholder="Re-enter your password"
            />

            <div className={`register__checkbox ${errors.acceptTerms ? 'register__field--error' : ''}`}>
              <label className="register__checkbox-label">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={form.acceptTerms}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <span className="register__checkbox-box" />
                <span>
                  I agree to the{' '}
                  <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                </span>
              </label>
              {errors.acceptTerms && <span className="register__error">{errors.acceptTerms}</span>}
            </div>

            <button type="submit" className="btn btn-primary register__submit">
              Register
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
              <span style={{ padding: '0 1rem', color: '#6b7280', fontSize: '0.9rem' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signup_with"
                width="100%"
              />
            </div>
          </form>

          <p className="register__login-link">
            Already have an account?{' '}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
