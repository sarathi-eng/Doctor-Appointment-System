import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Icon } from '../../components/ui/Icons';
import {
  normalizeDoctorData,
  validateDoctorFields,
  isValidEmail,
  isValidPhone
} from '../../utils/doctorUtils';

const AdminDoctors = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    qualification: '',
    description: '',
    password: 'doctor123'
  });
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [doctorsRes, usersRes] = await Promise.all([
        fetch('http://localhost:5000/doctors'),
        fetch('http://localhost:5000/users')
      ]);
      
      const doctorsData = await doctorsRes.json();
      const usersData = await usersRes.json();
      
      setDoctors(doctorsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDoctors = () => {
    if (!searchTerm) return doctors;
    
    return doctors.filter(doctor =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.qualification.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Validate single field
  const validateField = (name, value) => {
    const tempData = { ...formData, [name]: value };
    const validation = validateDoctorFields(tempData);
    
    setValidationErrors(prev => ({
      ...prev,
      [name]: validation.errors[name] || ''
    }));
    
    return !validation.errors[name];
  };

  // Handle input change with validation
  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation for critical fields
    if (['fullName', 'email', 'phone', 'experience'].includes(name)) {
      validateField(name, value);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      specialization: '',
      experience: '',
      qualification: '',
      description: '',
      password: 'doctor123'
    });
    setValidationErrors({});
    setIsSubmitting(false);
    setMessage('');
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
    setMessage('');
  };

  const openViewModal = (doctor) => {
    setSelectedDoctor(doctor);
    setIsViewModalOpen(true);
    setMessage('');
  };

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      fullName: doctor.name,
      email: doctor.user?.email || '',
      phone: doctor.user?.phone || '',
      specialization: doctor.specialization,
      experience: doctor.experience,
      qualification: doctor.qualification,
      description: doctor.description,
      password: 'doctor123' // Don't show actual password
    });
    setValidationErrors({});
    setIsEditModalOpen(true);
    setMessage('');
  };

  const handleAddDoctor = async () => {
    setIsSubmitting(true);
    setMessage('');
    
    try {
      // Validate all fields
      const validation = validateDoctorFields(formData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setMessage('Please correct the errors below before submitting.');
        return;
      }

      // Normalize data
      const normalizedData = normalizeDoctorData(formData);
      
      // Get the admin's clinic ID
      const clinicId = user?.clinicId;
      
      if (!clinicId) {
        setMessage('Error: Clinic ID not found. Please contact administrator.');
        return;
      }

      // Generate unique user ID
      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Create user first with only basic user fields
      const userResponse = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          email: normalizedData.email,
          password: formData.password,
          role: 'doctor',
          name: normalizedData.fullName,
          phone: normalizedData.phone,
          clinicId: clinicId
        }),
      });
      
      if (userResponse.ok) {
        const newUser = await userResponse.json();
        
        // Create doctor
        const doctorResponse = await fetch('http://localhost:5000/doctors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            clinicId: clinicId,
            name: normalizedData.fullName,
            specialization: normalizedData.specialization,
            experience: normalizedData.experience,
            qualification: normalizedData.qualification,
            description: normalizedData.description,
            availableSlots: []
          }),
        });
        
        if (doctorResponse.ok) {
          setMessage('✅ Doctor added successfully!');
          setIsAddModalOpen(false);
          resetForm();
          fetchData();
        } else {
          const errorData = await doctorResponse.json();
          setMessage('Failed to create doctor: ' + (errorData.message || errorData.error || 'Unknown error'));
        }
      } else {
        const userError = await userResponse.json();
        setMessage('Failed to create user: ' + (userError.message || userError.error || 'Email/phone might already exist'));
      }
    } catch (error) {
      setMessage('Failed to add doctor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDoctor = async () => {
    setIsSubmitting(true);
    setMessage('');
    
    try {
      // Validate required fields (excluding email as it's disabled)
      const editData = { ...formData };
      const validation = validateDoctorFields(editData);
      
      // Remove email validation error if present (since email is disabled)
      if (validation.errors.email) {
        delete validation.errors.email;
      }
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setMessage('Please correct the errors below before submitting.');
        return;
      }

      // Normalize data
      const normalizedData = normalizeDoctorData(formData);

      // Update user
      if (selectedDoctor.user) {
        const userResponse = await fetch(`http://localhost:5000/users/${selectedDoctor.user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: normalizedData.fullName,
            phone: normalizedData.phone,
            specialization: normalizedData.specialization,
            experience: normalizedData.experience,
            qualification: normalizedData.qualification
          }),
        });

        if (!userResponse.ok) {
          const userError = await userResponse.json();
          setMessage('Failed to update user: ' + (userError.message || userError.error || 'Unknown error'));
          return;
        }
      }

      // Update doctor
      const doctorResponse = await fetch(`http://localhost:5000/doctors/${selectedDoctor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: normalizedData.fullName,
          specialization: normalizedData.specialization,
          experience: normalizedData.experience,
          qualification: normalizedData.qualification,
          description: normalizedData.description
        }),
      });

      if (doctorResponse.ok) {
        setMessage('✅ Doctor updated successfully!');
        setIsEditModalOpen(false);
        setSelectedDoctor(null);
        resetForm();
        fetchData();
      } else {
        const doctorError = await doctorResponse.json();
        setMessage('Failed to update doctor: ' + (doctorError.message || doctorError.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      setMessage('Failed to update doctor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (doctor) => {
    if (!confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) {
      return;
    }

    try {
      // Delete doctor first
      const doctorResponse = await fetch(`http://localhost:5000/doctors/${doctor.id}`, {
        method: 'DELETE',
      });

      if (doctorResponse.ok) {
        // Delete user
        if (doctor.userId) {
          await fetch(`http://localhost:5000/users/${doctor.userId}`, {
            method: 'DELETE',
          });
        }
        
        setMessage('Doctor deleted successfully!');
        fetchData();
      } else {
        setMessage('Failed to delete doctor. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      setMessage('Failed to delete doctor. Please try again.');
    }
  };

  const getUserById = (userId) => {
    return users.find(user => user.id === userId);
  };

  if (loading) {
    return (
      <div style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            width: '32px',
            height: '32px',
            border: '2px solid #e5e7eb',
            borderBottom: '2px solid #2563eb',
            borderRadius: '50%'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Manage Doctors</h1>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Add, edit, and remove doctors from the system.
            </p>
          </div>
          <Button 
            onClick={openAddModal}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '18px' }}>➕</span>
            Add Doctor
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ maxWidth: '400px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            🔍
          </div>
          <input
            type="text"
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              outline: 'none',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = '#2563eb';
              e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </Card>

      {/* Message */}
      {message && (
        <div style={{
          marginBottom: '16px',
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: message.includes('success') ? '#ecfdf5' : '#fef2f2',
          color: message.includes('success') ? '#065f46' : '#991b1b',
          border: `1px solid ${message.includes('success') ? '#a7f3d0' : '#fecaca'}`
        }}>
          {message}
        </div>
      )}

      {/* Doctors Grid */}
      {getFilteredDoctors().length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ color: '#9ca3af', marginBottom: '16px' }}>
            <span style={{ fontSize: '48px' }}>👨‍⚕️</span>
          </div>
          <p style={{ color: '#6b7280' }}>
            {searchTerm ? 'No doctors found matching your search.' : 'No doctors found.'}
          </p>
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {getFilteredDoctors().map((doctor) => {
            const doctorUser = getUserById(doctor.userId);
            return (
              <Card key={doctor.id}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ flex: '1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <div style={{
                        backgroundColor: '#dbeafe',
                        borderRadius: '50%',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '24px' }}>👨‍⚕️</span>
                      </div>
                      <div style={{ flex: '1' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{doctor.name}</h3>
                        <p style={{ fontSize: '14px', color: '#2563eb', fontWeight: '500' }}>{doctor.specialization}</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>{doctor.description}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Experience:</span> {doctor.experience}
                        </p>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>
                          <span style={{ fontWeight: '500' }}>Qualification:</span> {doctor.qualification}
                        </p>
                        {doctorUser && (
                          <>
                            <p style={{ fontSize: '14px', color: '#6b7280' }}>
                              <span style={{ fontWeight: '500' }}>📧 Email:</span> {doctorUser.email}
                            </p>
                            <p style={{ fontSize: '14px', color: '#6b7280' }}>
                              <span style={{ fontWeight: '500' }}>📞 Phone:</span> {doctorUser.phone}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    paddingTop: '16px', 
                    borderTop: '1px solid #e5e7eb', 
                    display: 'flex', 
                    gap: '8px', 
                    marginTop: '16px' 
                  }}>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => openViewModal(doctor)}
                      style={{ 
                        flex: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>👁️</span>
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => openEditModal(doctor)}
                      style={{ 
                        flex: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>✏️</span>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDeleteDoctor(doctor)}
                      style={{ 
                        flex: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>🗑️</span>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Doctor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
          setMessage('');
        }}
        title="➕ Add New Doctor"
        size="large"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Full Name *
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${validationErrors.fullName ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = validationErrors.fullName ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Dr. Ram Kumar"
              />
              {validationErrors.fullName && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', marginLeft: '4px' }}>
                  {validationErrors.fullName}
                </p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Email *
              </label>
              <input
                type="email"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${validationErrors.email ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = validationErrors.email ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="doctor@clinic.com"
              />
              {validationErrors.email && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', marginLeft: '4px' }}>
                  {validationErrors.email}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Phone *
              </label>
              <input
                type="tel"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${validationErrors.phone ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = validationErrors.phone ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="9876543210"
              />
              {validationErrors.phone && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', marginLeft: '4px' }}>
                  {validationErrors.phone}
                </p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Specialization *
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${validationErrors.specialization ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = validationErrors.specialization ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Cardiology"
              />
              {validationErrors.specialization && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', marginLeft: '4px' }}>
                  {validationErrors.specialization}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Experience *
              </label>
              <input
                type="number"
                min="0"
                max="60"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${validationErrors.experience ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                placeholder="10"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = validationErrors.experience ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {validationErrors.experience && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', marginLeft: '4px' }}>
                  {validationErrors.experience}
                </p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Qualification *
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${validationErrors.qualification ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                placeholder="e.g., MD, PhD"
                value={formData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = validationErrors.qualification ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {validationErrors.qualification && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', marginLeft: '4px' }}>
                  {validationErrors.qualification}
                </p>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Description
            </label>
            <textarea
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                resize: 'none'
              }}
              placeholder="Brief description of the doctor's expertise..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <Button
              onClick={handleAddDoctor}
              disabled={isSubmitting || !formData.fullName || !formData.email || !formData.specialization}
              style={{ 
                flex: '1',
                background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              <span>{isSubmitting ? '⏳' : '➕'}</span>
              {isSubmitting ? 'Adding...' : 'Add Doctor'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
                setMessage('');
              }}
              style={{ 
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>❌</span>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Doctor Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedDoctor(null);
        }}
        title={`👁️ Doctor Details`}
        size="large"
      >
        {selectedDoctor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <div style={{
                height: '80px',
                width: '80px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <span style={{ fontSize: '32px' }}>👨‍⚕️</span>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                {selectedDoctor.name}
              </h3>
              <p style={{ fontSize: '18px', color: '#2563eb', fontWeight: '600' }}>
                {selectedDoctor.specialization}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f0f9ff', 
                borderRadius: '12px', 
                border: '1px solid #bae6fd' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>💼</span>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0c4a6e' }}>Experience</h4>
                </div>
                <p style={{ fontSize: '14px', color: '#075985' }}>{selectedDoctor.experience}</p>
              </div>

              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f0fdf4', 
                borderRadius: '12px', 
                border: '1px solid #bbf7d0' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🎓</span>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#14532d' }}>Qualification</h4>
                </div>
                <p style={{ fontSize: '14px', color: '#166534' }}>{selectedDoctor.qualification}</p>
              </div>

              <div style={{ 
                padding: '16px', 
                backgroundColor: '#faf5ff', 
                borderRadius: '12px', 
                border: '1px solid #e9d5ff' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📧</span>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#581c87' }}>Email</h4>
                </div>
                <p style={{ fontSize: '14px', color: '#7c3aed' }}>{selectedDoctor.user?.email || 'N/A'}</p>
              </div>

              <div style={{ 
                padding: '16px', 
                backgroundColor: '#fff7ed', 
                borderRadius: '12px', 
                border: '1px solid #fed7aa' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📞</span>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#9a3412' }}>Phone</h4>
                </div>
                <p style={{ fontSize: '14px', color: '#c2410c' }}>{selectedDoctor.user?.phone || 'N/A'}</p>
              </div>
            </div>

            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8fafc', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>📝</span>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Description</h4>
              </div>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                {selectedDoctor.description || 'No description available.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedDoctor(null);
                }}
                style={{ 
                  flex: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>❌</span>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Doctor Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDoctor(null);
          resetForm();
          setMessage('');
        }}
        title="✏️ Edit Doctor"
        size="large"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Full Name *
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Email *
              </label>
              <input
                type="email"
                disabled
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  backgroundColor: '#f9fafb',
                  color: '#6b7280'
                }}
                value={formData.email}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Phone *
              </label>
              <input
                type="tel"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Specialization *
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Experience *
              </label>
              <input
                type="number"
                min="0"
                max="60"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Qualification *
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                value={formData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Description
            </label>
            <textarea
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                resize: 'none'
              }}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <Button
              onClick={handleEditDoctor}
              disabled={!formData.fullName || !formData.specialization}
              style={{ 
                flex: '1',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>💾</span>
              Update Doctor
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedDoctor(null);
                resetForm();
                setMessage('');
              }}
              style={{ 
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>❌</span>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDoctors;