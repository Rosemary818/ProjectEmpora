import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ChangePassword.css';

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

function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (password) => {
    return {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
  };

  const strength = getPasswordStrength(form.newPassword);
  const isPasswordStrong = strength.length && strength.upper && strength.lower && strength.number && strength.special;

  const validate = (data) => {
    const newErrors = {};
    if (!data.currentPassword) newErrors.currentPassword = 'Required';
    
    if (!data.newPassword) {
      newErrors.newPassword = 'Required';
    } else if (!isPasswordStrong) {
      newErrors.newPassword = 'Password does not meet all requirements';
    }

    if (!data.confirmPassword) {
      newErrors.confirmPassword = 'Required';
    } else if (data.newPassword !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    
    if (touched[name]) {
      setErrors(validate(updated));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setSuccessMessage('');
    
    const validationErrors = validate(form);
    setErrors(validationErrors);
    setTouched({ currentPassword: true, newPassword: true, confirmPassword: true });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Password changed successfully! Redirecting...');
        
        // Update user state in local storage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            user.mustChangePassword = false;
            localStorage.setItem('user', JSON.stringify(user));
            
            setTimeout(() => {
              if (user.role === 'SuperAdmin') navigate('/super-admin/dashboard');
              else if (user.role === 'HRAdmin') navigate('/hr/dashboard');
              else if (user.role === 'Manager') navigate('/manager/dashboard');
              else if (user.role === 'Employee') navigate('/employee/dashboard');
              else if (user.role === 'ServiceExecutive') navigate('/service-executive/dashboard');
              else navigate('/career-portal/dashboard');
            }, 1500);
          } catch (e) {
            setTimeout(() => navigate('/login'), 1500);
          }
        } else {
          setTimeout(() => navigate('/login'), 1500);
        }
      } else {
        setGlobalError(data.error || data.message || 'Incorrect current password or failed to change password');
      }
    } catch (err) {
      setGlobalError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-pw-page">
      <div className="change-pw-brand">
        <span className="change-pw-brand-icon">
          <svg viewBox="0 0 48 32" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="14" r="5" />
            <path d="M3 32 C3 25, 8 22, 12 22 C16 22, 21 25, 21 32 Z" />
            <circle cx="36" cy="14" r="5" />
            <path d="M27 32 C27 25, 32 22, 36 22 C40 22, 45 25, 45 32 Z" />
            <circle cx="24" cy="11" r="6.5" />
            <path d="M12 32 C12 21, 17 17, 24 17 C31 17, 36 21, 36 32 Z" />
          </svg>
        </span>
        <span className="change-pw-brand-text">EMPORA</span>
      </div>

      <div className="change-pw-form-container">
        <div className="change-pw-form-header">
          <h2>Change Password</h2>
          <p>For your security, please update your temporary password before continuing.</p>
        </div>

        {globalError && <div className="change-pw-alert change-pw-alert-error">{globalError}</div>}
        {successMessage && <div className="change-pw-alert change-pw-alert-success">{successMessage}</div>}

        <form className="change-pw-form" onSubmit={handleSubmit} noValidate>
          <div className={`change-pw-field ${errors.currentPassword && touched.currentPassword ? 'change-pw-field--error' : ''}`}>
            <label htmlFor="currentPassword">Current (Temporary) Password</label>
            <div className="change-pw-input-wrap">
              <input
                type={showCurrent ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter current password"
                autoComplete="current-password"
                disabled={loading || successMessage}
              />
              <button
                type="button"
                className="change-pw-toggle-pw"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showCurrent} />
              </button>
            </div>
            {errors.currentPassword && touched.currentPassword && <span className="change-pw-error">{errors.currentPassword}</span>}
          </div>

          <div className={`change-pw-field ${errors.newPassword && touched.newPassword ? 'change-pw-field--error' : ''}`}>
            <label htmlFor="newPassword">New Password</label>
            <div className="change-pw-input-wrap">
              <input
                type={showNew ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={loading || successMessage}
              />
              <button
                type="button"
                className="change-pw-toggle-pw"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showNew} />
              </button>
            </div>
            
            {/* Dynamic Requirements */}
            <div className="change-pw-requirements">
              <p>Password must contain:</p>
              <ul>
                <li className={strength.length ? 'met' : ''}>At least 8 characters</li>
                <li className={strength.upper ? 'met' : ''}>One uppercase letter</li>
                <li className={strength.lower ? 'met' : ''}>One lowercase letter</li>
                <li className={strength.number ? 'met' : ''}>One number</li>
                <li className={strength.special ? 'met' : ''}>One special character</li>
              </ul>
            </div>
            {errors.newPassword && touched.newPassword && <span className="change-pw-error">{errors.newPassword}</span>}
          </div>

          <div className={`change-pw-field ${errors.confirmPassword && touched.confirmPassword ? 'change-pw-field--error' : ''}`}>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="change-pw-input-wrap">
              <input
                type={showConfirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={loading || successMessage}
              />
              <button
                type="button"
                className="change-pw-toggle-pw"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {errors.confirmPassword && touched.confirmPassword && <span className="change-pw-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary change-pw-submit" disabled={loading || successMessage}>
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
