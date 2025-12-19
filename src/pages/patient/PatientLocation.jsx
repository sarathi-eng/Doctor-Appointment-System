import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  getUniqueStates,
  getDistrictsForState,
  getAreasForDistrict,
  normalizeLocation
} from '../../utils/locationUtils';

const PatientLocation = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load locations from backend
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      } else {
        throw new Error('Failed to load locations');
      }
    } catch (err) {
      console.error('Error loading locations:', err);
      setError('Failed to load locations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedState) {
      const districts = getDistrictsForState(locations, selectedState);
      setAvailableDistricts(districts);
      setSelectedDistrict('');
      setSelectedArea('');
      setAvailableAreas([]);
    }
  }, [selectedState, locations]);

  useEffect(() => {
    if (selectedState && selectedDistrict) {
      const areas = getAreasForDistrict(locations, selectedState, selectedDistrict);
      setAvailableAreas(areas);
      setSelectedArea('');
    }
  }, [selectedState, selectedDistrict, locations]);

  const handleContinue = () => {
    if (selectedState && selectedDistrict && selectedArea) {
      navigate('/patient/clinics', { 
        state: { 
          selectedLocation: { 
            state: selectedState, 
            district: selectedDistrict, 
            area: selectedArea 
          } 
        } 
      });
    }
  };

  const isFormValid = selectedState && selectedDistrict && selectedArea;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Card style={{ 
          padding: '40px', 
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: 'none'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60px',
            width: '60px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            borderRadius: '50%',
            marginBottom: '24px',
            animation: 'pulse 2s infinite'
          }}>
            <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
            </svg>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            Loading Locations...
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Please wait while we load available locations
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <Card style={{ 
          padding: '40px', 
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: 'none'
        }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Button
                variant="outline"
                onClick={() => navigate('/patient/dashboard')}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                ← Back to Dashboard
              </Button>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '80px',
              width: '80px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              borderRadius: '50%',
              marginBottom: '24px',
              boxShadow: '0 20px 40px rgba(79, 70, 229, 0.3)'
            }}>
              <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Find Nearby Healthcare
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              Select your location to find clinics and doctors near you
            </p>
          </div>

          {/* Location Selection Form */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  backgroundColor: loading ? '#f9fafb' : 'white',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4f46e5';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">
                  {loading ? 'Loading states...' : 'Select State'}
                </option>
                {getUniqueStates(locations).map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {selectedState && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4f46e5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select District</option>
                  {availableDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedState && selectedDistrict && (
              <div style={{ marginBottom: '32px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Area/Locality
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4f46e5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select Area</option>
                  {availableAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedState && selectedDistrict && selectedArea && (
              <div style={{
                padding: '16px',
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                border: '1px solid #0ea5e9',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#0c4a6e',
                  fontWeight: '500',
                  margin: 0
                }}>
                  📍 {selectedArea}, {selectedDistrict}, {selectedState}
                </p>
              </div>
            )}

            <Button
              onClick={handleContinue}
              disabled={!isFormValid}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: isFormValid 
                  ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                  : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isFormValid ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                boxShadow: isFormValid ? '0 10px 25px rgba(79, 70, 229, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (isFormValid) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 15px 35px rgba(79, 70, 229, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (isFormValid) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.3)';
                }
              }}
            >
              Continue to Find Clinics →
            </Button>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>
              🔒 Your location is used only to find nearby healthcare providers
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientLocation;
