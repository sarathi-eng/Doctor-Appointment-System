// Location utility functions for dynamic location management

/**
 * Normalize location strings to Title Case (trim spaces, capitalize each word)
 */
export const normalizeLocation = (str) => {
  if (!str || str === null || str === undefined) {
    return str;
  }
  return str
  .toLowerCase()
  .trim()
  .replace(/\s+/g, ' ')
  .split(' ')
  .filter(word => word!== '')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');
};

/**
 * Check if a location already exists in the locations array
 */
export const isLocationExists = (locations, state, district, area) => {
  const normalizedState = normalizeLocation(state);
  const normalizedDistrict = normalizeLocation(district);
  const normalizedArea = normalizeLocation(area);
  
  return locations.some(location => 
    normalizeLocation(location.state) === normalizedState &&
    normalizeLocation(location.district) === normalizedDistrict &&
    normalizeLocation(location.area) === normalizedArea
  );
};

/**
 * Find unique states from locations
 */
export const getUniqueStates = (locations) => {
  const states = [...new Set(locations.map(loc => normalizeLocation(loc.state)))];
  return states.sort();
};

/**
 * Get districts for a specific state
 */
export const getDistrictsForState = (locations, state) => {
  const normalizedState = normalizeLocation(state);
  const districts = locations
   .filter(loc => normalizeLocation(loc.state) === normalizedState && loc.district)
   .map(loc => normalizeLocation(loc.district))
   .filter(district => district); // Remove null/empty districts
  return [...new Set(districts)].sort();
};

/**
 * Get areas for a specific state and district
 */
export const getAreasForDistrict = (locations, state, district) => {
  const normalizedState = normalizeLocation(state);
  const normalizedDistrict = normalizeLocation(district);
  const areas = locations
   .filter(loc =>
      normalizeLocation(loc.state) === normalizedState &&
      normalizeLocation(loc.district) === normalizedDistrict &&
      loc.area
    )
   .map(loc => normalizeLocation(loc.area))
   .filter(area => area); // Remove null/empty areas
  return [...new Set(areas)].sort();
};

/**
 * Find location by ID
 */
export const findLocationById = (locations, locationId) => {
  return locations.find(loc => loc.id === locationId);
};

/**
 * Find location by state, district, area
 */
export const findLocationByDetails = (locations, state, district, area) => {
  return locations.find(loc => 
    normalizeLocation(loc.state) === normalizeLocation(state) &&
    normalizeLocation(loc.district) === normalizeLocation(district) &&
    normalizeLocation(loc.area) === normalizeLocation(area)
  );
};

/**
 * Generate unique ID for new location
 */
export const generateLocationId = (locations) => {
  const maxId = locations.reduce((max, loc) => {
    const id = parseInt(loc.id);
    return id > max ? id : max;
  }, 0);
  return (maxId + 1).toString();
};

/**
 * Create a new location object
 */
export const createLocation = (state, district, area) => {
  return {
    id: '', // Will be set by the caller
    state: normalizeLocation(state),
    district: normalizeLocation(district),
    area: normalizeLocation(area)
  };
};

/**
 * Format location display string
 */
export const formatLocationDisplay = (location) => {
  return `${location.area}, ${location.district}, ${location.state}`;
};

/**
 * Validate location fields
 */
export const validateLocation = (state, district, area) => {
  const errors = [];
  
  if (!state || state.trim().length === 0) {
    errors.push('State is required');
  }
  
  // District and area are now optional for partial saves
  if (district && district.trim().length === 0) {
    errors.push('District cannot be empty');
  }
  
  if (area && area.trim().length === 0) {
    errors.push('Area cannot be empty');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Search locations by partial text
 */
export const searchLocations = (locations, searchTerm) => {
  const normalizedSearch = normalizeLocation(searchTerm);
  
  if (!normalizedSearch) return locations;
  
  return locations.filter(location => 
    normalizeLocation(location.state).includes(normalizedSearch) ||
    normalizeLocation(location.district).includes(normalizedSearch) ||
    normalizeLocation(location.area).includes(normalizedSearch)
  );
};