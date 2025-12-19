/**
 * Get or generate a device ID for the current browser
 * @returns {string} Device ID
 */
export const getDeviceId = () => {
  // Check if device ID already exists in localStorage
  const storedDeviceId = localStorage.getItem('deviceId');
  if (storedDeviceId) {
    return storedDeviceId;
  }

  // Generate new device ID
  const deviceId = generateDeviceId();
  
  // Store in localStorage
  localStorage.setItem('deviceId', deviceId);
  
  return deviceId;
};

/**
 * Generate a unique device ID
 * @returns {string} Generated device ID
 */
export const generateDeviceId = () => {
  const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return deviceId;
};