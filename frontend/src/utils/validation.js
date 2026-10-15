

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, error: string | null, strength: 'weak' | 'medium' | 'strong' }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required', strength: 'weak' };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters',
      strength: 'weak',
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strengthScore =
    (hasUpperCase ? 1 : 0) +
    (hasLowerCase ? 1 : 0) +
    (hasNumbers ? 1 : 0) +
    (hasSpecialChar ? 1 : 0);

  let strength = 'weak';
  if (strengthScore === 4) strength = 'strong';
  else if (strengthScore >= 2) strength = 'medium';

  return { isValid: true, error: null, strength };
};

/**
 * Validates that passwords match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  return { isValid: true, error: null };
};

/**
 * Validates full name
 * @param {string} name - Name to validate
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  if (name.trim().length > 100) {
    return { isValid: false, error: 'Name must not exceed 100 characters' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates account number (16 digit, numeric)
 * @param {string} accountNumber - Account number to validate
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateAccountNumber = (accountNumber) => {
  if (!accountNumber || !accountNumber.trim()) {
    return { isValid: false, error: 'Account number is required' };
  }

  const cleaned = accountNumber.replace(/\s/g, '');

  if (!/^\d{16}$/.test(cleaned)) {
    return { isValid: false, error: 'Account number must be 16 digits' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates monetary amount
 * @param {string|number} amount - Amount to validate
 * @param {object} options - { min: number, max: number }
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateAmount = (amount, options = {}) => {
  const { min = 0.01, max = 999999.99 } = options;

  if (amount === null || amount === undefined || amount === '') {
    return { isValid: false, error: 'Amount is required' };
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }

  if (numAmount < min) {
    return { isValid: false, error: `Amount must be at least ${min}` };
  }

  if (numAmount > max) {
    return { isValid: false, error: `Amount must not exceed ${max}` };
  }

  return { isValid: true, error: null };
};

/**
 * Validates phone number (basic international format)
 * @param {string} phone - Phone number to validate
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Basic validation: allow +1-234-567-8900 or 1234567890 format
  const phoneRegex = /^[\d\s\-+()]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Invalid phone number format' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates account name (alphanumeric and spaces)
 * @param {string} accountName - Account name to validate
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateAccountName = (accountName) => {
  if (!accountName || !accountName.trim()) {
    return { isValid: false, error: 'Account name is required' };
  }

  if (accountName.trim().length < 2) {
    return { isValid: false, error: 'Account name must be at least 2 characters' };
  }

  if (accountName.trim().length > 50) {
    return { isValid: false, error: 'Account name must not exceed 50 characters' };
  }

  if (!/^[a-zA-Z0-9\s\-_]+$/.test(accountName)) {
    return {
      isValid: false,
      error: 'Account name can only contain letters, numbers, spaces, hyphens and underscores',
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field (for error message)
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || !String(value).trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true, error: null };
};

/**
 * Validates that a field has minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length required
 * @param {string} fieldName - Name of the field
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateMinLength = (value, minLength, fieldName = 'This field') => {
  if (String(value).length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }
  return { isValid: true, error: null };
};

/**
 * Validates that a field has maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length allowed
 * @param {string} fieldName - Name of the field
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateMaxLength = (value, maxLength, fieldName = 'This field') => {
  if (String(value).length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${maxLength} characters`,
    };
  }
  return { isValid: true, error: null };
};

/**
 * Validates form data using a schema
 * @param {object} formData - Form data to validate
 * @param {object} schema - Validation schema with field rules
 * @returns {object} - { isValid: boolean, errors: { [fieldName]: string } }
 *
 * Example schema:
 * {
 *   email: [validateRequired('Email'), validateEmail],
 *   password: [validateRequired('Password'), validatePassword],
 * }
 */
export const validateForm = (formData, schema) => {
  const errors = {};

  Object.keys(schema).forEach((fieldName) => {
    const validators = schema[fieldName];
    const value = formData[fieldName];

    for (const validator of validators) {
      const result = typeof validator === 'function' ? validator(value) : validator;

      if (!result.isValid) {
        errors[fieldName] = result.error;
        break;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
