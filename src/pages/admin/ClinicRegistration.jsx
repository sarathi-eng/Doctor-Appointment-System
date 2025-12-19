import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LocationSelector from '../../components/location/LocationSelector';
import { getDeviceId } from '../../utils/deviceId';
import { 
  normalizeClinicData, 
  validateClinicFields,
  isValidClinicEmail,
  isValidClinicPhone
} from '../../utils/clinicUtils';

const ClinicRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    description: '',
    locationId: null
  });
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);

  // Load existing locations
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await fetch('http://localhost:5000/locations');
      const data = await response.json();
      setLocations(data);
    } catch (err) {
      console.error('Failed to load locations:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation for critical fields
    if (['name', 'email', 'phone', 'password', 'confirmPassword'].includes(name)) {
      validateField(name, value);
    }
  };

  // Validate single field
  const validateField = (name, value) => {
    const tempData = { ...formData, [name]: value };
    const validation = validateClinicFields(tempData);
    
    setValidationErrors(prev => ({
      ...prev,
      [name]: validation.errors[name] || ''
    }));
    
    return !validation.errors[name];
  };

  const handleLocationSelect = (location) => {
    console.log("ClinicRegistration: handleLocationSelect called with:", location);
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      locationId: location.id
    }));
    setIsLocationConfirmed(true);
    setError('');
  };

  const handleLocationAdd = (newLocation) => {
    console.log("ClinicRegistration: handleLocationAdd called with:", newLocation);
    setSelectedLocation(newLocation);
    setFormData(prev => ({
      ...prev,
      locationId: newLocation.id
    }));
    // Add new location to the locations list
    setLocations(prev => [...prev, newLocation]);
    setSuccess('Location added successfully!');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    if (!formData.locationId) {
      setError('Please select a location');
      return;
    }

    // Validate all fields
    const validation = validateClinicFields(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setError('Please correct the errors below before submitting.');
      return;
    }

    try {
      const deviceId = getDeviceId();
      
      // Normalize data
      const normalizedData = normalizeClinicData(formData);
      
      // Create clinic data
      const clinicData = {
        name: normalizedData.name,
        address: normalizedData.address,
        phone: normalizedData.phone,
        email: normalizedData.email,
        description: normalizedData.description,
        locationId: formData.locationId,
        deviceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // First create the clinic
      const clinicResponse = await fetch('http://localhost:5000/clinics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clinicData)
      });

      if (!clinicResponse.ok) {
        const errorData = await clinicResponse.json();
        setError(errorData.message || 'Failed to register clinic');
        return;
      }

      const clinic = await clinicResponse.json();
      
      // Then create the admin user account
      const adminUserId = 'admin_' + clinic.id + '_' + Date.now(); // Generate unique admin ID
      const adminUserData = {
        id: adminUserId,
        email: normalizedData.email,
        password: formData.password, // Don't normalize password
        role: 'admin',
        name: normalizedData.name,
        phone: normalizedData.phone,
        deviceId,
        status: 'active',
        clinicId: clinic.id.toString()
      };

      const userResponse = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminUserData)
      });

      if (userResponse.ok) {
        setSuccess('Clinic and admin account registered successfully!');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const userError = await userResponse.json();
        setError('Clinic created but failed to create admin account: ' + (userError.message || userError.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register clinic. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const trustSignals = [
    { text: 'Easy setup', icon: '⚡' },
    { text: 'Manage doctors', icon: '👨‍⚕️' },
    { text: 'Track appointments', icon: '📅' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    }}>
      {/* Left Side - Branding Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '64px',
        background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo and Brand */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '48px' }}>
            <div style={{
              height: '56px',
              width: '56px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#2563EB'
              }}>
                DC
              </div>
            </div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              margin: 0,
              letterSpacing: '-0.025em'
            }}>
              DoctorCare
            </h1>
          </div>

          {/* Main Headline */}
          <h2 style={{
            fontSize: '48px',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '24px',
            letterSpacing: '-0.025em'
          }}>
            Healthcare Scheduling<br />
            <span style={{ opacity: 0.9 }}>Made Simple</span>
          </h2>

          {/* Benefit Points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '18px', fontWeight: '500' }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: '#22C55E',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                flexShrink: 0
              }}>
                <svg width="12" height="12" fill="white" viewBox="0 0 12 12">
                  <path d="M3.5 8.5L1.5 6.5L2.2 5.8L3.5 7.1L8.8 1.8L9.5 2.5L3.5 8.5Z"/>
                </svg>
              </div>
              Register your clinic in minutes
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '18px', fontWeight: '500' }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: '#22C55E',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                flexShrink: 0
              }}>
                <svg width="12" height="12" fill="white" viewBox="0 0 12 12">
                  <path d="M3.5 8.5L1.5 6.4 5.8L3.5 7.1L8.8 1.8L9.5 2.5L3.5 8.5Z"/>
                </svg>
              </div>
              Manage your medical team
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '18px', fontWeight: '500' }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: '#22C55E',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                flexShrink: 0
              }}>
                <svg width="12" height="12" fill="white" viewBox="0 0 12 12">
                  <path d="M3.5 8.5L1.5 6.5L2.2 5.8L3.5 7.1L8.8 1.8L9.5 2.5L3.5 8.5Z"/>
                </svg>
              </div>
              Grow your healthcare practice
            </div>
          </div>

          {/* Trust Icons */}
          <div style={{ 
            display: 'flex', 
            gap: '32px', 
            paddingTop: '32px',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {trustSignals.map((signal, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '14px',
                opacity: 0.9
              }}>
                <span style={{ fontSize: '16px' }}>{signal.icon}</span>
                <span>{signal.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ maxWidth: '450px', width: '100%' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Form Header */}
            <div style={{
              padding: '32px 32px 24px',
              textAlign: 'center',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'white',
                fontSize: '24px'
              }}>
                🏥
              </div>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#1e293b', 
                marginBottom: '8px' 
              }}>
                Register Your Clinic
              </h3>
              <p style={{ 
                fontSize: '14px', 
                color: '#64748b' 
              }}>
                Set up your clinic to start accepting appointments
              </p>
              
              {/* Back to Login Link */}
              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  ← Back to Login
                </button>
              </div>
            </div>
            
            <div style={{ padding: '32px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {error && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                {success && (
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#166534',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {success}
                  </div>
                )}

                {/* Location Selection */}
                <LocationSelector
                  locations={locations}
                  selectedLocationId={formData.locationId}
                  onLocationSelect={handleLocationSelect}
                  onLocationAdd={handleLocationAdd}
                  onLocationSaved={loadLocations}
                  error={error}
                />

                {/* Clinic Information */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '20px',
                  marginTop: '8px'
                }}>
                  <div>
                    <label htmlFor="name" style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Clinic Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Enter clinic name"
                      value={formData.name}
                      onChange={handleInputChange}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 16px',
                        border: `1px solid ${validationErrors.name ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#374151',
                        transition: 'all 0.3s ease',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563EB';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = validationErrors.name ? '#ef4444' : '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {validationErrors.name && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', marginLeft: '4px' }}>
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Address *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      required
                      rows="3"
                      placeholder="Enter clinic address"
                      value={formData.address}
                      onChange={handleInputChange}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#374151',
                        transition: 'all 0.3s ease',
                        backgroundColor: 'white',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563EB';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 16px',
                        border: `1px solid ${validationErrors.phone ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#374151',
                        transition: 'all 0.3s ease',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563EB';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = validationErrors.phone ? '#ef4444' : '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {validationErrors.phone && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', marginLeft: '4px' }}>
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="clinic@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 16px',
                        border: `1px solid ${validationErrors.email ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#374151',
                        transition: 'all 0.3s ease',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563EB';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = validationErrors.email ? '#ef4444' : '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {validationErrors.email && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', marginLeft: '4px' }}>
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Password *
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="Enter password (min 6 characters)"
                      value={formData.password}
                      onChange={handleInputChange}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 16px',
                        border: `1px solid ${validationErrors.password ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#374151',
                        transition: 'all 0.3s ease',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563EB';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = validationErrors.password ? '#ef4444' : '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {validationErrors.password && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', marginLeft: '4px' }}>
                        {validationErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Confirm Password *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 16px',
                        border: `1px solid ${validationErrors.confirmPassword ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#374151',
                        transition: 'all 0.3s ease',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563EB';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = validationErrors.confirmPassword ? '#ef4444' : '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {validationErrors.confirmPassword && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', marginLeft: '4px' }}>
                        {validationErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      placeholder="Brief description of your clinic"
                      value={formData.description}
                      onChange={handleInputChange}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#374151',
                        transition: 'all 0.3s ease',
                        backgroundColor: 'white',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563EB';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isLocationConfirmed}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '14px 24px',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    background: (!isSubmitting && isLocationConfirmed) ? '#2563EB' : '#9ca3af',
                    transition: 'all 0.3s ease',
                    cursor: (!isSubmitting && isLocationConfirmed) ? 'pointer' : 'not-allowed',
                    opacity: isSubmitting ? 0.5 : 1,
                    position: 'relative',
                    overflow: 'hidden',
                    marginTop: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting && isLocationConfirmed) {
                      e.target.style.background = '#1d4ed8';
                      e.target.style.boxShadow = '0 0 20px rgba(37, 99, 235, 0.4)';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting && isLocationConfirmed) {
                      e.target.style.background = '#2563EB';
                      e.target.style.boxShadow = 'none';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {isSubmitting ? 'Registering Clinic...' : 'Register Your Clinic'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicRegistration;
