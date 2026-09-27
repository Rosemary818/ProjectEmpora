export function validateIndianMobileNumber(phone, isRequired = true) {
  if (!phone) {
    return isRequired ? 'Phone number is required' : '';
  }
  
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return 'Please enter a valid 10-digit Indian mobile number.'
  }
  
  if (/^(.)\1{9}$/.test(phone)) {
    return 'Please enter a valid mobile number.'
  }
  
  return ''
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', checks: [] }

  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /\d/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ]

  const metCount = checks.filter((c) => c.met).length

  let score = 0
  let label = 'Weak'

  if (password.length < 6) {
    score = 1
    label = 'Weak'
  } else if (metCount <= 2) {
    score = 1
    label = 'Weak'
  } else if (metCount === 3) {
    score = 2
    label = 'Fair'
  } else if (metCount === 4) {
    score = 3
    label = 'Good'
  } else {
    score = 4
    label = 'Strong'
  }

  return { score, label, checks }
}

export function validateRegisterForm(data) {
  const errors = {}

  if (!data.firstName.trim()) {
    errors.firstName = 'First name is required'
  } else if (data.firstName.startsWith(' ')) {
    errors.firstName = 'First name cannot start with a space'
  } else if (!/^[a-zA-Z\s'-]{2,50}$/.test(data.firstName.trim())) {
    errors.firstName = 'Enter a valid first name (letters only, min 2 characters)'
  }

  if (!data.lastName.trim()) {
    errors.lastName = 'Last name is required'
  } else if (data.lastName.startsWith(' ')) {
    errors.lastName = 'Last name cannot start with a space'
  } else if (!/^[a-zA-Z\s'-]{2,50}$/.test(data.lastName.trim())) {
    errors.lastName = 'Enter a valid last name (letters only, min 2 characters)'
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Enter a valid email address'
  }

  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required'
  } else {
    const phoneError = validateIndianMobileNumber(data.phone.trim())
    if (phoneError) {
      errors.phone = phoneError
    }
  }

  if (!data.password) {
    errors.password = 'Password is required'
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.password = 'Password must include uppercase, lowercase, and a number'
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  if (!data.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions'
  }

  return errors
}

export function validateLoginForm(data) {
  const errors = {}

  if (!data.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Enter a valid email address'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return errors
}
