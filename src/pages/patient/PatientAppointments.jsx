import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const PatientAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const [appointmentsRes, doctorsRes] = await Promise.all([
        fetch(`http://localhost:5000/appointments?patientId=${user.id}&_sort=date&_order=desc`),
        fetch('http://localhost:5000/doctors')
      ]);
      
      const appointmentsData = await appointmentsRes.json();
      const doctorsData = await doctorsRes.json();
      
      // Combine appointments with doctor details
      const appointmentsWithDoctors = appointmentsData.map(appointment => {
        const doctor = doctorsData.find(d => d.id === parseInt(appointment.doctorId));
        return { ...appointment, doctor };
      });
      
      setAppointments(appointmentsWithDoctors);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    
    switch (filter) {
      case 'upcoming':
        return appointments.filter(apt => apt.date >= today && apt.status !== 'cancelled' && apt.status !== 'completed');
      case 'past':
        return appointments.filter(apt => apt.date < today || apt.status === 'completed');
      case 'cancelled':
        return appointments.filter(apt => apt.status === 'cancelled');
      default:
        return appointments;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return { backgroundColor: '#d1fae5', color: '#065f46' };
      case 'pending': return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'cancelled': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'completed': return { backgroundColor: '#dbeafe', color: '#1e40af' };
      default: return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const canCancelAppointment = (appointment) => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    const timeDiff = appointmentDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff >= 1 && (appointment.status === 'confirmed' || appointment.status === 'pending');
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const response = await fetch(`http://localhost:5000/appointments/${selectedAppointment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled',
          notes: cancelReason ? `Cancelled by patient: ${cancelReason}` : 'Cancelled by patient'
        }),
      });

      if (response.ok) {
        setMessage('Appointment cancelled successfully!');
        setIsCancelModalOpen(false);
        setSelectedAppointment(null);
        setCancelReason('');
        fetchAppointments(); // Refresh appointments
      } else {
        setMessage('Failed to cancel appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setMessage('Failed to cancel appointment. Please try again.');
    }
  };

  const openViewModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
    setMessage('');
  };

  const openCancelModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsCancelModalOpen(true);
    setCancelReason('');
    setMessage('');
  };

  return (
    <div style={{ padding: '16px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>My Appointments</h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          View and manage your appointment history and upcoming visits.
        </p>
      </div>

      {/* Filter Tabs */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          backgroundColor: '#f3f4f6', 
          padding: '4px', 
          borderRadius: '12px' 
        }}>
          {[
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'past', label: 'Past' },
            { key: 'cancelled', label: 'Cancelled' },
            { key: 'all', label: 'All' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                flex: '1',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: filter === tab.key ? 'white' : 'transparent',
                color: filter === tab.key ? '#2563eb' : '#6b7280',
                boxShadow: filter === tab.key ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (filter !== tab.key) {
                  e.target.style.color = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== tab.key) {
                  e.target.style.color = '#6b7280';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
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

      {/* Appointments List */}
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
      ) : getFilteredAppointments().length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ color: '#9ca3af', marginBottom: '16px' }}>
            <svg style={{ height: '48px', width: '48px', margin: '0 auto' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12l4 4m0-4l-4 4m4-4v12" />
            </svg>
          </div>
          <p style={{ color: '#6b7280' }}>
            {filter === 'upcoming' && 'No upcoming appointments'}
            {filter === 'past' && 'No past appointments'}
            {filter === 'cancelled' && 'No cancelled appointments'}
            {filter === 'all' && 'No appointments found'}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {getFilteredAppointments().map((appointment) => {
            const statusStyle = getStatusColor(appointment.status);
            return (
              <Card key={appointment.id}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: '1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        backgroundColor: '#dbeafe',
                        borderRadius: '50%',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg style={{ width: '24px', height: '24px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div style={{ flex: '1' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{appointment.doctor.name}</h3>
                        <p style={{ fontSize: '14px', color: '#2563eb', fontWeight: '500', marginBottom: '8px' }}>{appointment.doctor.specialization}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <svg style={{ width: '16px', height: '16px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12l4 4m0-4l-4 4m4-4v12" />
                            </svg>
                            {new Date(appointment.date).toLocaleDateString()}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <svg style={{ width: '16px', height: '16px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {appointment.time}
                          </div>
                        </div>
                        {appointment.reason && (
                          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '500' }}>Reason:</span> {appointment.reason}
                          </p>
                        )}
                        {appointment.notes && appointment.status === 'cancelled' && (
                          <p style={{ fontSize: '14px', color: '#dc2626', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '500' }}>Cancellation reason:</span> {appointment.notes}
                          </p>
                        )}
                      </div>
                      <div style={{ flexShrink: '0' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'capitalize',
                          backgroundColor: statusStyle.backgroundColor,
                          color: statusStyle.color
                        }}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ flexShrink: '0', display: 'flex', gap: '8px', marginLeft: '16px' }}>
                    <Button 
                      variant="outline" 
                      size="small"
                      onClick={() => openViewModal(appointment)}
                    >
                      View Details
                    </Button>
                    {canCancelAppointment(appointment) && (
                      <Button 
                        variant="danger" 
                        size="small"
                        onClick={() => openCancelModal(appointment)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedAppointment(null);
          setMessage('');
        }}
        title="Appointment Details"
      >
        {selectedAppointment && (
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
                <svg style={{ width: '32px', height: '32px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                {selectedAppointment.doctor.name}
              </h3>
              <p style={{ fontSize: '18px', color: '#2563eb', fontWeight: '600' }}>
                {selectedAppointment.doctor.specialization}
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
                  <svg style={{ width: '20px', height: '20px', color: '#0ea5e9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12l4 4m0-4l-4 4m4-4v12" />
                  </svg>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0c4a6e' }}>Date & Time</h4>
                </div>
                <p style={{ fontSize: '14px', color: '#075985', marginBottom: '4px' }}>
                  📅 {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p style={{ fontSize: '14px', color: '#075985' }}>
                  🕐 {selectedAppointment.time}
                </p>
              </div>

              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f0fdf4', 
                borderRadius: '12px', 
                border: '1px solid #bbf7d0' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <svg style={{ width: '20px', height: '20px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#14532d' }}>Status</h4>
                </div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  backgroundColor: getStatusColor(selectedAppointment.status).backgroundColor,
                  color: getStatusColor(selectedAppointment.status).color
                }}>
                  {selectedAppointment.status}
                </span>
              </div>
            </div>

            {selectedAppointment.reason && (
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <svg style={{ width: '20px', height: '20px', color: '#475569' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Reason for Visit</h4>
                </div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                  {selectedAppointment.reason}
                </p>
              </div>
            )}

            {selectedAppointment.notes && (
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <svg style={{ width: '20px', height: '20px', color: '#475569' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Notes</h4>
                </div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                  {selectedAppointment.notes}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedAppointment(null);
                }}
                style={{ 
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Appointment Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedAppointment(null);
          setCancelReason('');
          setMessage('');
        }}
        title="Cancel Appointment"
      >
        {selectedAppointment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{selectedAppointment.doctor.name}</h4>
              <p style={{ fontSize: '14px', color: '#2563eb', marginBottom: '4px' }}>{selectedAppointment.doctor.specialization}</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Reason for cancellation (optional)
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
                placeholder="Please let us know why you're cancelling this appointment..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
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
                variant="danger"
                onClick={handleCancelAppointment}
                style={{ flex: '1' }}
              >
                Cancel Appointment
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setSelectedAppointment(null);
                  setCancelReason('');
                  setMessage('');
                }}
                style={{ flex: '1' }}
              >
                Keep Appointment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientAppointments;
