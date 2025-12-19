// Doctor normalization utilities

/**
 * Normalize full name to Title Case
 * Rule: Trim spaces, single space between words, Title Case
 * Example: "  dr. raM  kuMAR  " → "Dr. Ram Kumar"
 */
export const normalizeName = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .split(' ')
    .map(word => {
      if (word.toLowerCase() === 'dr.' || word.toLowerCase() === 'dr') {
        return 'Dr.';
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

/**
 * Normalize email to lowercase
 * Rule: Lowercase, trim, must be valid email format
 * Example: "RAM@GMAIL.COM " → "ram@gmail.com"
 */
export const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  
  return email.trim().toLowerCase();
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Normalize phone number to digits only
 * Rule: Digits only, trim, length check (India: 10 digits)
 * Example: "+91 98765 43210" → "9876543210"
 */
export const normalizePhone = (phone) => {
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
export const isValidPhone = (phone) => {
  const normalized = normalizePhone(phone);
  return normalized.length === 10;
};

/**
 * Normalize specialization to Title Case
 * Rule: Title Case, trim
 * Example: "cardiology" → "Cardiology"
 */
export const normalizeSpecialization = (specialization) => {
  if (!specialization || typeof specialization !== 'string') return '';
  
  return specialization
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Normalize experience to integer
 * Rule: Number only, integer, range check (0–60)
 */
export const normalizeExperience = (experience) => {
  if (!experience && experience !== 0) return 0;
  
  const num = parseInt(experience, 10);
  
  if (isNaN(num)) return 0;
  
  // Clamp between 0 and 60
  return Math.max(0, Math.min(60, num));
};

/**
 * Normalize qualification to uppercase standard medical format
 * Rule: Uppercase standard medical format, trim
 * Example: "mbbs, md" → "MBBS, MD"
 */
export const normalizeQualification = (qualification) => {
  if (!qualification || typeof qualification !== 'string') return '';
  
  return qualification
    .trim()
    .replace(/\s*,\s*/g, ', ') // Normalize comma spacing
    .toUpperCase();
};

/**
 * Normalize description (trim only)
 * Rule: Trim only, no formatting required
 */
export const normalizeDescription = (description) => {
  if (!description || typeof description !== 'string') return '';
  
  return description.trim();
};

/**
 * Validate all doctor fields
 */
export const validateDoctorFields = (data) => {
  const errors = {};
  
  // Check required fields
  if (!data.fullName?.trim()) {
    errors.fullName = 'Full name is required';
  }
  
  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (!data.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(data.phone)) {
    errors.phone = 'Phone number must be 10 digits';
  }
  
  if (!data.specialization?.trim()) {
    errors.specialization = 'Specialization is required';
  }
  
  if (data.experience === '' || data.experience === null || data.experience === undefined) {
    errors.experience = 'Experience is required';
  } else {
    const exp = normalizeExperience(data.experience);
    if (exp < 0 || exp > 60) {
      errors.experience = 'Experience must be between 0 and 60 years';
    }
  }
  
  if (!data.qualification?.trim()) {
    errors.qualification = 'Qualification is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Normalize all doctor data at once
 */
export const normalizeDoctorData = (data) => {
  return {
    fullName: normalizeName(data.fullName),
    email: normalizeEmail(data.email),
    phone: normalizePhone(data.phone),
    specialization: normalizeSpecialization(data.specialization),
    experience: normalizeExperience(data.experience),
    qualification: normalizeQualification(data.qualification),
    description: normalizeDescription(data.description)
  };
};