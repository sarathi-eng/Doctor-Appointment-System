import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const PatientDoctors = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Get context from navigation state
  const selectedLocation = location.state?.selectedLocation;
  const selectedClinic = location.state?.selectedClinic;

  useEffect(() => {
    if (!selectedLocation || !selectedClinic) {
      navigate('/patient/location');
      return;
    }
    fetchData();
  }, [selectedLocation, selectedClinic, navigate]);

  // Early return if data is missing
  if (!selectedLocation || !selectedClinic) {
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
            borderBottom: '2px solid #2563eb',
            borderRadius: '50%',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Redirecting to location selection...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, specializationFilter]);

  const fetchData = async () => {
    try {
      // Fetch doctors for the selected clinic only
      const doctorsRes = await fetch(`http://localhost:5000/doctors?clinicId=${selectedClinic.id}`);
      const doctorsData = await doctorsRes.json();
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/patient/clinics', { 
      state: { selectedLocation } 
    });
  };

  const handleClinicChange = () => {
    navigate('/patient/clinics', { 
      state: { selectedLocation } 
    });
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (specializationFilter) {
      filtered = filtered.filter(doctor => doctor.specialization === specializationFilter);
    }

    setFilteredDoctors(filtered);
  };

  const getUniqueSpecializations = () => {
    return [...new Set(doctors.map(doctor => doctor.specialization))];
  };

  const getAvailableSlotsForDate = (doctor, date) => {
    if (!date) return [];
    
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = doctor.availableSlots.find(slot => slot.day === dayOfWeek);
    
    if (!daySchedule) return [];

    return daySchedule.times;
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !bookingDate || !bookingTime || !bookingReason) {
      setMessage('Please fill in all fields');
      return;
    }

    setBookingLoading(true);
    setMessage('');

    try {
      // Check if the slot is already booked
      const existingResponse = await fetch(`http://localhost:5000/appointments?doctorId=${selectedDoctor.id}&date=${bookingDate}&time=${bookingTime}`);
      const existingAppointments = await existingResponse.json();

      if (existingAppointments.length > 0) {
        setMessage('This time slot is already booked. Please choose another time.');
        setBookingLoading(false);
        return;
      }

      // Create new appointment
      const newAppointment = {
        patientId: user.id,
        doctorId: selectedDoctor.id,
        clinicId: selectedClinic.id,
        date: bookingDate,
        time: bookingTime,
        status: 'pending',
        reason: bookingReason,
        notes: '',
        createdAt: new Date().toISOString()
      };

      const response = await fetch('http://localhost:5000/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAppointment),
      });

      if (response.ok) {
        setMessage('Appointment booked successfully!');
        setIsBookingModalOpen(false);
        setBookingDate('');
        setBookingTime('');
        setBookingReason('');
        setSelectedDoctor(null);
      } else {
        setMessage('Failed to book appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setMessage('Failed to book appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div style={{ padding: '16px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button
              variant="outline"
              onClick={handleBack}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              ← Back to Clinics
            </Button>
            <Button
              variant="outline"
              onClick={handleClinicChange}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Change Clinic
            </Button>
          </div>
        </div>
        
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Doctors at {selectedClinic.name}
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          {selectedClinic.address}
        </p>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: '#f0f9ff',
          borderRadius: '20px',
          border: '1px solid #0ea5e9',
          fontSize: '14px',
          color: '#0284c7'
        }}>
          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {selectedLocation.area}, {selectedLocation.district}, {selectedLocation.state}
        </div>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Search by name or specialty
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
              placeholder="Enter doctor name or specialty..."
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
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Filter by specialization
            </label>
            <select
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                backgroundColor: 'white'
              }}
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">All Specializations</option>
              {getUniqueSpecializations().map(specialization => (
                <option key={specialization} value={specialization}>
                  {specialization}
                </option>
              ))}
            </select>
          </div>
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
      {loading ? (
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
      ) : filteredDoctors.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: '#6b7280' }}>No doctors found matching your criteria.</p>
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {filteredDoctors.map((doctor) => (
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
                      <svg style={{ width: '32px', height: '32px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{doctor.name}</h3>
                      <p style={{ fontSize: '14px', color: '#2563eb', fontWeight: '500' }}>{doctor.specialization}</p>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{doctor.description}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        <span style={{ fontWeight: '500' }}>Experience:</span> {doctor.experience}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        <span style={{ fontWeight: '500' }}>Qualification:</span> {doctor.qualification}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  <Button
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setIsBookingModalOpen(true);
                    }}
                    style={{ width: '100%' }}
                  >
                    Book Appointment
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedDoctor(null);
          setBookingDate('');
          setBookingTime('');
          setBookingReason('');
          setMessage('');
        }}
        title={`Book Appointment with ${selectedDoctor?.name}`}
        size="large"
      >
        {selectedDoctor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{selectedDoctor.name}</h4>
              <p style={{ fontSize: '14px', color: '#2563eb', marginBottom: '4px' }}>{selectedDoctor.specialization}</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>{selectedDoctor.description}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Select Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  value={bookingDate}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    setBookingTime(''); // Reset time when date changes
                  }}
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

              {bookingDate && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Select Time
                  </label>
                  <select
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      outline: 'none',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'white'
                    }}
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Choose a time</option>
                    {getAvailableSlotsForDate(selectedDoctor, bookingDate).map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              )}
</div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Reason for Visit
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
                placeholder="Please describe the reason for your appointment..."
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
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

            <div style={{ display: 'flex', gap: '16px' }}>
              <Button
                onClick={handleBookAppointment}
                disabled={!bookingDate || !bookingTime || !bookingReason || bookingLoading}
                loading={bookingLoading}
                style={{ flex: '1' }}
              >
                Book Appointment
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsBookingModalOpen(false);
                  setSelectedDoctor(null);
                  setBookingDate('');
                  setBookingTime('');
                  setBookingReason('');
                  setMessage('');
                }}
                style={{ flex: '1' }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientDoctors;
