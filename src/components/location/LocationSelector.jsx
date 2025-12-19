import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import {
  getUniqueStates,
  getDistrictsForState,
  getAreasForDistrict,
  isLocationExists,
  generateLocationId,
  createLocation,
  validateLocation,
  formatLocationDisplay,
  normalizeLocation
} from '../../utils/locationUtils';

const LocationSelector = ({ 
  locations = [], 
  selectedLocationId, 
  onLocationSelect, 
  onLocationAdd,
  onLocationSaved,
  error 
}) => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [showAddState, setShowAddState] = useState(false);
  const [showAddDistrict, setShowAddDistrict] = useState(false);
  const [showAddArea, setShowAddArea] = useState(false);
  const [newState, setNewState] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newArea, setNewArea] = useState('');
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(''); // Track which level is being saved
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
  const [confirmedLocationId, setConfirmedLocationId] = useState(null);

  // Load existing locations on mount
  useEffect(() => {
    if (selectedLocationId && locations.length > 0) {
      const location = locations.find(loc => loc.id === selectedLocationId);
      if (location) {
        setSelectedState(location.state);
        setSelectedDistrict(location.district);
        setSelectedArea(location.area);
        updateAvailableOptions(location.state, location.district);
      }
    }
  }, [selectedLocationId, locations]);

  const updateAvailableOptions = (state, district) => {
    if (state) {
      const districts = getDistrictsForState(locations, state);
      setAvailableDistricts(districts);
      
      if (district) {
        const areas = getAreasForDistrict(locations, state, district);
        setAvailableAreas(areas);
      } else {
        setAvailableAreas([]);
      }
    } else {
      setAvailableDistricts([]);
      setAvailableAreas([]);
    }
  };

  const savePartialLocation = async (state, district = null, area = null) => {
    try {
      // Validate required fields
      if (!state || !state.trim()) {
        console.error('Cannot save location without state:', { state, district, area });
        throw new Error('State is required');
      }

      // Normalize the state (district and area can be null)
      const cleanState = normalizeLocation(state);
      const cleanDistrict = district ? normalizeLocation(district) : null;
      const cleanArea = area ? normalizeLocation(area) : null;

      if (!cleanState) {
        console.error('Cannot save location with invalid normalized state:', { cleanState, cleanDistrict, cleanArea });
        throw new Error('Invalid state data after normalization');
      }

      // Check for existing locations based on what we're saving
      let existingLocation;
      if (cleanArea) {
        // Complete location (state + district + area)
        existingLocation = locations.find(loc => 
          normalizeLocation(loc.state) === cleanState &&
          normalizeLocation(loc.district) === cleanDistrict &&
          normalizeLocation(loc.area) === cleanArea
        );
      } else if (cleanDistrict) {
        // State + District
        existingLocation = locations.find(loc => 
          normalizeLocation(loc.state) === cleanState &&
          normalizeLocation(loc.district) === cleanDistrict
        );
      } else {
        // State only
        existingLocation = locations.find(loc => 
          normalizeLocation(loc.state) === cleanState
        );
      }

      if (existingLocation) {
        console.log('Location already exists, reusing existing location');
        return existingLocation;
      }

      // Create a partial location object
      const locationData = {
        state: cleanState,
        district: cleanDistrict,
        area: cleanArea
      };

      console.log('Saving new partial location:', locationData);

      const response = await fetch('http://localhost:5000/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData)
      });

      if (response.ok) {
        const savedLocation = await response.json();
        return savedLocation;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save location');
      }
    } catch (err) {
      console.error('Error saving location:', err);
      throw err;
    }
  };

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedDistrict('');
    setSelectedArea('');
    setShowAddState(false);
    setNewState('');
    updateAvailableOptions(state, '');
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedArea('');
    setShowAddDistrict(false);
    setNewDistrict('');
    updateAvailableOptions(selectedState, district);
  };

  const handleAreaChange = (area) => {
    setSelectedArea(area);
    setShowAddArea(false);
    setNewArea('');
  };

  const handleAddNewState = async () => {
    if (!newState.trim()) return;

    setSaving('state');
    setLocationError('');

    try {
      // Save new state to database
      const cleanState = normalizeLocation(newState);
      const savedLocation = await savePartialLocation(cleanState, null, null);

      // Update local state
      setSelectedState(cleanState);
      setSelectedDistrict('');
      setSelectedArea('');
      setShowAddState(false);
      setNewState('');

      // Refresh locations list to show new state in dropdown
      if (onLocationAdd) {
        onLocationAdd(savedLocation);
      }

      // Refresh available options
      updateAvailableOptions(cleanState, '');

      // Show success message
      alert(`State "${cleanState}" added successfully!`);

    } catch (err) {
      console.error('Error adding state:', err);
      setLocationError('Failed to add state. Please try again.');
    } finally {
      setSaving('');
    }
  };

  const handleAddNewDistrict = async () => {
    if (!newDistrict.trim()) return;

    setSaving('district');
    setLocationError('');

    try {
      // Save new district to database
      const cleanDistrict = normalizeLocation(newDistrict);
      const savedLocation = await savePartialLocation(selectedState, cleanDistrict, null);

      // Update local state
      setSelectedDistrict(cleanDistrict);
      setSelectedArea('');
      setShowAddDistrict(false);
      setNewDistrict('');

      // Refresh locations list to show new district in dropdown
      if (onLocationAdd) {
        onLocationAdd(savedLocation);
      }

      // Refresh available options
      updateAvailableOptions(selectedState, cleanDistrict);

      // Show success message
      alert(`District "${cleanDistrict}" added successfully!`);

    } catch (err) {
      console.error('Error adding district:', err);
      setLocationError('Failed to add district. Please try again.');
    } finally {
      setSaving('');
    }
  };

  const handleAddNewArea = async () => {
    if (!newArea.trim()) return;

    setSaving('area');
    setLocationError('');

    try {
      // 🔥 INSTANT SAVE - Area level is complete location
      const cleanArea = normalizeLocation(newArea);

      // Check if we have state and district (required for complete location)
      if (!selectedState || !selectedDistrict) {
        setLocationError('Please select State and District first');
        return;
      }

      // Check for duplicates
      const exists = locations.find(loc =>
        normalizeLocation(loc.state) === normalizeLocation(selectedState) &&
        normalizeLocation(loc.district) === normalizeLocation(selectedDistrict) &&
        normalizeLocation(loc.area) === cleanArea
      );

      if (exists) {
        // Reuse existing location
        setSelectedArea(cleanArea);
        setShowAddArea(false);
        setNewArea('');
        alert(`Area "${cleanArea}" already exists and was selected!`);
      } else {
        // Save new complete location
        const newLocation = {
          state: normalizeLocation(selectedState),
          district: normalizeLocation(selectedDistrict),
          area: cleanArea
        };

        const res = await fetch("http://localhost:5000/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newLocation)
        });

        if (res.ok) {
          const saved = await res.json();
          console.log("Instant saved new area location:", saved);

          // Update local state
          setSelectedArea(cleanArea);
          setShowAddArea(false);
          setNewArea('');

          // Add to locations list and refresh
          if (onLocationAdd) {
            onLocationAdd(saved);
          }

          // Refresh locations from server
          if (onLocationSaved) {
            onLocationSaved();
          }

          // Show success message
          alert(`Area "${cleanArea}" saved successfully!`);

          // Refresh available options
          updateAvailableOptions(selectedState, selectedDistrict);
        } else {
          throw new Error('Failed to save area');
        }
      }

    } catch (err) {
      console.error('Error adding area:', err);
      setLocationError('Failed to add area. Please try again.');
    } finally {
      setSaving('');
    }
  };

  const handleConfirmLocation = async () => {
    if (!selectedState || !selectedDistrict || !selectedArea) {
      alert("Please select State, District and Area");
      return;
    }

    const cleanState = normalizeLocation(selectedState);
    const cleanDistrict = normalizeLocation(selectedDistrict);
    const cleanArea = normalizeLocation(selectedArea);

    // 1️⃣ Check if location already exists
    const existing = locations.find(loc =>
      normalizeLocation(loc.state) === cleanState &&
      normalizeLocation(loc.district) === cleanDistrict &&
      normalizeLocation(loc.area) === cleanArea
    );

    let locationId;

    if (existing) {
      // 2️⃣ Reuse existing location
      locationId = existing.id;
      console.log("Reusing existing location:", existing);
    } else {
      // 3️⃣ Save new location
      const newLocation = {
        state: cleanState,
        district: cleanDistrict,
        area: cleanArea
      };

      const res = await fetch("http://localhost:5000/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLocation)
      });

      const saved = await res.json();
      locationId = saved.id;
      console.log("Saved new location:", saved);
    }

    // 4️⃣ Mark location as confirmed
    setConfirmedLocationId(locationId);
    setIsLocationConfirmed(true);

    // Call parent callback
    const confirmedLocation = locations.find(loc => loc.id === locationId) ||
                             { id: locationId, state: cleanState, district: cleanDistrict, area: cleanArea };
    onLocationSelect(confirmedLocation);
  };

  const canConfirmLocation = (selectedState || newState.trim()) &&
                           (selectedDistrict || newDistrict.trim()) &&
                           (selectedArea || newArea.trim()) &&
                           !isLocationConfirmed;

  const states = getUniqueStates(locations);

  return (
    <Card style={{ marginBottom: '24px' }}>
      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
          Select Location
        </h3>

        {/* State Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#374151', 
            marginBottom: '8px' 
          }}>
            State
          </label>
          
          {!showAddState ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                disabled={isLocationConfirmed}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  backgroundColor: isLocationConfirmed ? '#f9fafb' : 'white',
                  color: isLocationConfirmed ? '#6b7280' : '#111827'
                }}
              >
                <option value="">Select State</option>
                {states.map(state => {
                  const cleanState = normalizeLocation(state);
                  return (
                    <option key={cleanState} value={cleanState}>
                      {cleanState}
                    </option>
                  );
                })}
              </select>
              <Button
                variant="outline"
                onClick={() => setShowAddState(true)}
                disabled={isLocationConfirmed}
                style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}
              >
                + Add New
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                placeholder="Enter new state"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}
              />
              <Button
                onClick={handleAddNewState}
                disabled={!newState.trim() || saving === 'state'}
                style={{ padding: '12px 16px' }}
              >
                {saving === 'state' ? 'Saving...' : 'Add'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddState(false);
                  setNewState('');
                }}
                style={{ padding: '12px 16px' }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* District Selection */}
        {(selectedState || newState.trim()) && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              District
            </label>
            
            {!showAddDistrict ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  disabled={isLocationConfirmed}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '14px',
                    backgroundColor: isLocationConfirmed ? '#f9fafb' : 'white',
                    color: isLocationConfirmed ? '#6b7280' : '#111827'
                  }}
                >
                  <option value="">Select District</option>
                  {availableDistricts.map(district => {
                    const cleanDistrict = normalizeLocation(district);
                    return (
                      <option key={cleanDistrict} value={cleanDistrict}>
                        {cleanDistrict}
                      </option>
                    );
                  })}
                </select>
                <Button
                  variant="outline"
                  onClick={() => setShowAddDistrict(true)}
                  disabled={isLocationConfirmed}
                  style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}
                >
                  + Add New
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  placeholder="Enter new district"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}
                />
                <Button
                  onClick={handleAddNewDistrict}
                  disabled={!newDistrict.trim() || saving === 'district'}
                  style={{ padding: '12px 16px' }}
                >
                  {saving === 'district' ? 'Saving...' : 'Add'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDistrict(false);
                    setNewDistrict('');
                  }}
                  style={{ padding: '12px 16px' }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Area Selection */}
        {(selectedState || newState.trim()) && (selectedDistrict || newDistrict.trim()) && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Area/Locality
            </label>
            
            {!showAddArea ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={selectedArea}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  disabled={isLocationConfirmed}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '14px',
                    backgroundColor: isLocationConfirmed ? '#f9fafb' : 'white',
                    color: isLocationConfirmed ? '#6b7280' : '#111827'
                  }}
                >
                  <option value="">Select Area</option>
                  {availableAreas.map(area => {
                    const cleanArea = normalizeLocation(area);
                    return (
                      <option key={cleanArea} value={cleanArea}>
                        {cleanArea}
                      </option>
                    );
                  })}
                </select>
                <Button
                  variant="outline"
                  onClick={() => setShowAddArea(true)}
                  disabled={isLocationConfirmed}
                  style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}
                >
                  + Add New
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  placeholder="Enter new area"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}
                />
                <Button
                  onClick={handleAddNewArea}
                  disabled={!newArea.trim() || saving === 'area'}
                  style={{ padding: '12px 16px' }}
                >
                  {saving === 'area' ? 'Saving...' : 'Add'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddArea(false);
                    setNewArea('');
                  }}
                  style={{ padding: '12px 16px' }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Selected Location Display */}
        {canConfirmLocation && (
          <div style={{
            padding: '16px',
            backgroundColor: '#f0f9ff',
            borderRadius: '12px',
            border: '1px solid #0ea5e9',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#0c4a6e',
              fontWeight: '500',
              margin: 0
            }}>
              📍 {(selectedArea || newArea.trim())}, {(selectedDistrict || newDistrict.trim())}, {(selectedState || newState.trim())}
            </p>
          </div>
        )}

        {/* Location Confirmed Display */}
        {isLocationConfirmed && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0',
            marginBottom: '16px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#166534', fontSize: '14px', fontWeight: '500' }}>
              ✅ Location confirmed
            </span>
          </div>
        )}

        {/* Error Display */}
        {(locationError || error) && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
            fontSize: '14px'
          }}>
            {locationError || error}
          </div>
        )}

        {/* Success Display */}
        {loading && (
          <div style={{
            marginBottom: '16px',
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Saving complete location...
          </div>
        )}

        {/* Confirm Button */}
        <Button
          onClick={handleConfirmLocation}
          disabled={!canConfirmLocation || loading || saving}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: (canConfirmLocation && !loading && !saving)
              ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
              : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: (canConfirmLocation && !loading && !saving) ? 'pointer' : 'not-allowed'
          }}
        >
          {loading ? 'Saving Location...' : 'Confirm Location'}
        </Button>
      </div>
    </Card>
  );
};

export default LocationSelector;
