import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './ResetPassword.css'

function EyeIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  )
}

function ResetPassword() {
  const [form, setForm] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validate()) {
      const email = sessionStorage.getItem('resetEmail')
      const otp = sessionStorage.getItem('resetOtp')
      
      if (!email || !otp) {
        setErrors({ password: 'Session expired. Please try resetting your password again.' })
        return
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, otp, newPassword: form.password }),
        })
        
        const data = await response.json()
        
        if (response.ok) {
          sessionStorage.removeItem('resetEmail')
          sessionStorage.removeItem('resetOtp')
          alert('Password reset successful! You can now log in with your new password.')
          navigate('/login')
        } else {
          setErrors({ password: data.message || 'Failed to reset password. The OTP might be invalid or expired.' })
        }
      } catch (err) {
        setErrors({ password: 'Network error. Please try again later.' })
      }
    }
  }

  return (
    <div className="reset">
      <div className="reset__panel">
        <Link to="/" className="reset__brand">
          <span className="reset__brand-icon">
            <svg viewBox="0 0 48 32" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="14" r="5" />
              <path d="M3 32 C3 25, 8 22, 12 22 C16 22, 21 25, 21 32 Z" />
              
              <circle cx="36" cy="14" r="5" />
              <path d="M27 32 C27 25, 32 22, 36 22 C40 22, 45 25, 45 32 Z" />
              
              <circle cx="24" cy="11" r="6.5" />
              <path d="M12 32 C12 21, 17 17, 24 17 C31 17, 36 21, 36 32 Z" />
            </svg>
          </span>
          <div className="reset__brand-text-group">
            <span className="reset__brand-text">EMPORA</span>
            <span className="reset__brand-subtext">Work. Connect. Grow.</span>
          </div>
        </Link>

        <div className="reset__panel-content">
          <h1>Create New Password</h1>
          <p>
            Your new password must be different from previous used passwords and at least 8 characters long.
          </p>
        </div>

        <p className="reset__panel-footer">
          Workplace Management Platform
        </p>
      </div>

      <div className="reset__form-section">
        <div className="reset__form-container">
          <div className="reset__form-header">
            <h2>Set a new password</h2>
            <p>Please enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="reset__form" noValidate>
            <div className={`reset__field ${errors.password ? 'reset__field--error' : ''}`}>
              <label htmlFor="password">New Password</label>
              <div className="reset__input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="reset__toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {errors.password && <span className="reset__error">{errors.password}</span>}
            </div>

            <div className={`reset__field ${errors.confirmPassword ? 'reset__field--error' : ''}`}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="reset__input-wrap">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="reset__toggle-pw"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>
              {errors.confirmPassword && <span className="reset__error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn-primary reset__btn-submit">
              Reset Password
            </button>
          </form>

          <div className="reset__form-footer">
            <Link to="/login" className="reset__login-link">
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

export default ResetPassword
