import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './VerifyOTP.css'

function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(60)
  const inputRefs = useRef([])
  const navigate = useNavigate()

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleChange = (e, index) => {
    const value = e.target.value
    if (isNaN(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
    if (pastedData.length === 0) return

    const newOtp = [...otp]
    pastedData.forEach((char, idx) => {
      newOtp[idx] = char
    })
    setOtp(newOtp)
    setError('')
    
    // Focus last filled input
    const focusIndex = Math.min(pastedData.length, 5)
    inputRefs.current[focusIndex].focus()
  }

  const handleResend = () => {
    if (timer > 0) return
    setTimer(60)
    setOtp(['', '', '', '', '', ''])
    setError('')
    inputRefs.current[0].focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const otpValue = otp.join('')
    if (otpValue.length < 6) {
      setError('Please enter all 6 digits')
      return
    }
    
    // Simulated API success
    navigate('/reset-password')
  }

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="verify">
      <div className="verify__panel">
        <Link to="/" className="verify__brand">
          <span className="verify__brand-icon">
            <svg viewBox="0 0 48 32" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="14" r="5" />
              <path d="M3 32 C3 25, 8 22, 12 22 C16 22, 21 25, 21 32 Z" />
              
              <circle cx="36" cy="14" r="5" />
              <path d="M27 32 C27 25, 32 22, 36 22 C40 22, 45 25, 45 32 Z" />
              
              <circle cx="24" cy="11" r="6.5" />
              <path d="M12 32 C12 21, 17 17, 24 17 C31 17, 36 21, 36 32 Z" />
            </svg>
          </span>
          <div className="verify__brand-text-group">
            <span className="verify__brand-text">EMPORA</span>
            <span className="verify__brand-subtext">Work. Connect. Grow.</span>
          </div>
        </Link>

        <div className="verify__panel-content">
          <h1>Security Verification</h1>
          <p>
            For your security, please verify your identity using the One-Time Password sent to your email.
          </p>
        </div>

        <p className="verify__panel-footer">
          Workplace Management Platform
        </p>
      </div>

      <div className="verify__form-section">
        <div className="verify__form-container">
          <div className="verify__form-header">
            <h2>Enter Verification Code</h2>
            <p>We've sent a 6-digit code to your email.</p>
          </div>

          <form onSubmit={handleSubmit} className="verify__form">
            <div className="verify__inputs" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`verify__input ${error ? 'verify__input--error' : ''}`}
                  autoComplete="off"
                />
              ))}
            </div>

            {error && <div className="verify__error">{error}</div>}

            <button type="submit" className="btn-primary verify__btn-submit">
              Verify Code
            </button>

            <div className="verify__resend-container">
              <span className="verify__timer">
                {timer > 0 ? (
                  <>Resend code in <strong>{formatTime(timer)}</strong></>
                ) : (
                  "Didn't receive the code?"
                )}
              </span>
              <button
                type="button"
                className={`verify__btn-resend ${timer > 0 ? 'verify__btn-resend--disabled' : ''}`}
                onClick={handleResend}
                disabled={timer > 0}
              >
                Resend OTP
              </button>
            </div>
          </form>

          <div className="verify__form-footer">
            <Link to="/login" className="verify__login-link">
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

export default VerifyOTP
