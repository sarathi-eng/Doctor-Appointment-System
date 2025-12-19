import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PatientClinics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [clinics, setClinics] = useState([]);
  const [filteredClinics, setFilteredClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedLocation = location.state?.selectedLocation;

  useEffect(() => {
    if (!selectedLocation) {
      navigate('/patient/location');
      return;
    }
    fetchClinics();
  }, [selectedLocation, navigate]);

  // Early return if data is missing
  if (!selectedLocation) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            width: '32px',
            height: '32px',
            border: '2px solid #e5e7eb',
            borderBottom: '2px solid #4f46e5',
            borderRadius: '50%',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Redirecting to location selection...</p>
        </div>
      </div>
    );
  }

  const fetchClinics = async () => {
    try {
      const response = await fetch('http://localhost:5000/clinics');
      const data = await response.json();
      setClinics(data);
      
      // Filter clinics by location
      const filtered = data.filter(clinic => 
        clinic.location?.state === selectedLocation.state &&
        clinic.location?.district === selectedLocation.district &&
        clinic.location?.area === selectedLocation.area
      );
      setFilteredClinics(filtered);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClinicSelect = (clinic) => {
    navigate('/patient/doctors', {
      state: {
        selectedLocation,
        selectedClinic: clinic
      }
    });
  };

  const handleBack = () => {
    navigate('/patient/location');
  };

  const handleChangeLocation = () => {
    navigate('/patient/location');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            width: '64px',
            height: '64px',
            border: '4px solid #e5e7eb',
            borderBottom: '4px solid #4f46e5',
            borderRadius: '50%',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Finding clinics in your area...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '32px 16px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
            <Button
              variant="outline"
              onClick={handleBack}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              ← Back
            </Button>
            <Button
              variant="outline"
              onClick={handleChangeLocation}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Change Location
            </Button>
          </div>
          
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Clinics Near You
          </h1>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#f0f9ff',
            borderRadius: '20px',
            border: '1px solid #0ea5e9',
            marginBottom: '16px'
          }}>
            <svg style={{ width: '16px', height: '16px', color: '#0284c7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#0284c7' 
            }}>
              {selectedLocation.area}, {selectedLocation.district}, {selectedLocation.state}
            </span>
          </div>
          
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Choose a clinic to view available doctors and book appointments
          </p>
        </div>

        {/* Clinics Grid */}
        {filteredClinics.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '64px 32px' }}>
            <div style={{
              height: '120px',
              width: '120px',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <svg style={{ width: '48px', height: '48px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              No clinics found in this area
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
              We couldn't find any healthcare clinics in {selectedLocation.area}. 
              Try selecting a nearby area or check back later.
            </p>
            <Button
              onClick={handleChangeLocation}
              style={{ padding: '12px 24px', backgroundColor: '#4f46e5' }}
            >
              Try Different Location
            </Button>
          </Card>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {filteredClinics.map((clinic) => (
              <Card key={clinic.id} style={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.borderColor = '#4f46e5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
              onClick={() => handleClinicSelect(clinic)}
              >
                <div style={{ padding: '24px' }}>
                  {/* Clinic Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '64px',
                      width: '64px',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      borderRadius: '20px',
                      boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
                      flexShrink: 0
                    }}>
                      <svg style={{ width: '28px', height: '28px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '20px', 
                        fontWeight: 'bold', 
                        color: '#111827', 
                        marginBottom: '4px',
                        lineHeight: '1.2'
                      }}>
                        {clinic.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                        <svg style={{ width: '14px', height: '14px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          {clinic.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clinic Details */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg style={{ width: '14px', height: '14px', color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{clinic.phone}</span>
                      </div>
                      {clinic.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg style={{ width: '14px', height: '14px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>{clinic.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Facilities */}
                    {clinic.facilities && clinic.facilities.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                          Facilities Available:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {clinic.facilities.slice(0, 4).map((facility, index) => (
                            <span
                              key={index}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#f0f9ff',
                                color: '#0284c7',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}
                            >
                              {facility}
                            </span>
                          ))}
                          {clinic.facilities.length > 4 && (
                            <span style={{
                              padding: '4px 8px',
                              backgroundColor: '#f3f4f6',
                              color: '#6b7280',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              +{clinic.facilities.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Operating Hours */}
                    {clinic.operatingHours && (
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                          Operating Hours:
                        </p>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                          <div style={{ marginBottom: '4px' }}>
                            <span style={{ fontWeight: '500' }}>Mon-Fri:</span> {clinic.operatingHours.monday}
                          </div>
                          <div>
                            <span style={{ fontWeight: '500' }}>Weekend:</span> {clinic.operatingHours.saturday}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClinicSelect(clinic);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <span>View Doctors & Book</span>
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientClinics;
