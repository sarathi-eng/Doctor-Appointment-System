import crypto from "crypto";

// AES-256-GCM Configuration
const ALGORITHM = "aes-256-gcm";

// Load secret key from environment variables
const getKey = () => {
  const key = process.env.AES_SECRET_KEY;
  if (!key) {
    throw new Error('AES_SECRET_KEY not found in environment variables');
  }
  return Buffer.from(key, "hex");
};

/**
 * Encrypt text using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text in format: iv:authTag:encrypted
 */
export function encrypt(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text provided for encryption');
  }

  const key = getKey();
  const iv = crypto.randomBytes(12); // 12 bytes for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypt text using AES-256-GCM
 * @param {string} data - Encrypted text in format: iv:authTag:encrypted
 * @returns {string} Decrypted text
 */
export function decrypt(data) {
  if (!data || typeof data !== 'string') {
    throw new Error('Invalid encrypted data provided for decryption');
  }

  const [ivHex, authTagHex, encrypted] = data.split(":");
  
  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Invalid encrypted data format');
  }

  const key = getKey();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Generate SHA-256 hash for duplicate checking
 * @param {string} value - Value to hash
 * @returns {string} SHA-256 hash in hex format
 */
export function hashValue(value) {
  if (!value || typeof value !== 'string') {
    throw new Error('Invalid value provided for hashing');
  }
  
  return crypto
    .createHash("sha256")
    .update(value.toLowerCase().trim()) // Normalize for consistent hashing
    .digest("hex");
}

/**
 * Safe encryption - returns null for null/undefined values
 * @param {string|null|undefined} value - Value to encrypt
 * @returns {string|null} Encrypted value or null
 */
export function safeEncrypt(value) {
  if (!value) return null;
  return encrypt(value);
}

/**
 * Safe decryption - returns empty string for null/undefined values
 * @param {string|null|undefined} value - Encrypted value
 * @returns {string} Decrypted value or empty string
 */
export function safeDecrypt(value) {
  if (!value) return '';
  try {
    return decrypt(value);
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return '';
  }
}