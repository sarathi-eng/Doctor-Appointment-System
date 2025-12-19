// Clinic normalization utilities

/**
 * Normalize clinic name to Title Case
 * Rule: Trim spaces, single space between words, Title Case
 * Example: "central hospital" → "Central Hospital"
 */
export const normalizeClinicName = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Normalize email to lowercase
 * Rule: Lowercase, trim, must be valid email format
 * Example: "INFO@HOSPITAL.COM " → "info@hospital.com"
 */
export const normalizeClinicEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  
  return email.trim().toLowerCase();
};

/**
 * Validate email format
 */
export const isValidClinicEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Normalize phone number to digits only
 * Rule: Digits only, trim, length check (India: 10 digits)
 * Example: "+91 98765 43210" → "9876543210"
 */
export const normalizeClinicPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  
  // Extract digits only
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Remove country code if present (91 or +91)
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly.slice(2);
  }
  
  return digitsOnly;
};

/**
 * Validate phone number (India: 10 digits)
 */
export const isValidClinicPhone = (phone) => {
  const normalized = normalizeClinicPhone(phone);
  return normalized.length === 10;
};

/**
 * Normalize address (trim only)
 * Rule: Trim only, no formatting required
 * Example: "  123 Medical Center Dr  " → "123 Medical Center Dr"
 */
export const normalizeClinicAddress = (address) => {
  if (!address || typeof address !== 'string') return '';
  
  return address.trim();
};

/**
 * Normalize description (trim only)
 * Rule: Trim only, no formatting required
 */
export const normalizeClinicDescription = (description) => {
  if (!description || typeof description !== 'string') return '';
  
  return description.trim();
};

/**
 * Validate all clinic fields
 */
export const validateClinicFields = (data) => {
  const errors = {};
  
  // Check required fields
  if (!data.name?.trim()) {
    errors.name = 'Clinic name is required';
  }
  
  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidClinicEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (!data.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!isValidClinicPhone(data.phone)) {
    errors.phone = 'Phone number must be 10 digits';
  }
  
  if (!data.address?.trim()) {
    errors.address = 'Address is required';
  }
  
  if (!data.password?.trim()) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Normalize all clinic data at once
 */
export const normalizeClinicData = (data) => {
  return {
    name: normalizeClinicName(data.name),
    email: normalizeClinicEmail(data.email),
    phone: normalizeClinicPhone(data.phone),
    address: normalizeClinicAddress(data.address),
    description: normalizeClinicDescription(data.description)
  };
};