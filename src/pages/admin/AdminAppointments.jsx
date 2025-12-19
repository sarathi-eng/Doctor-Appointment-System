import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const AdminAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [message, setMessage] = useState('');

  // Edit form data
  const [editFormData, setEditFormData] = useState({
    status: '',
    notes: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, doctorsRes, usersRes] = await Promise.all([
        fetch('http://localhost:5000/appointments?_sort=date&_order=desc'),
        fetch('http://localhost:5000/doctors'),
        fetch('http://localhost:5000/users')
      ]);
      
      const appointmentsData = await appointmentsRes.json();
      const doctorsData = await doctorsRes.json();
      const usersData = await usersRes.json();
      
      // Combine appointments with doctor and patient details
      const appointmentsWithDetails = appointmentsData.map(appointment => {
        const doctor = doctorsData.find(d => d.id === parseInt(appointment.doctorId));
        const patient = usersData.find(u => u.id === appointment.patientId);
        return { ...appointment, doctor, patient };
      });
      
      setAppointments(appointmentsWithDetails);
      setDoctors(doctorsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    let filtered = appointments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Apply date filter
    const today = new Date().toISOString().split('T')[0];
    
    switch (filter) {
      case 'today':
        return filtered.filter(apt => apt.date === today);
      case 'upcoming':
        return filtered.filter(apt => apt.date >= today && apt.status !== 'cancelled' && apt.status !== 'completed');
      case 'past':
        return filtered.filter(apt => apt.date < today || apt.status === 'completed');
      case 'pending':
        return filtered.filter(apt => apt.status === 'pending');
      case 'cancelled':
        return filtered.filter(apt => apt.status === 'cancelled');
      default:
        return filtered;
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

  const isToday = (date) => {
    return date === new Date().toISOString().split('T')[0];
  };

  const getStatusStats = () => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: appointments.length,
      today: appointments.filter(apt => apt.date === today).length,
      upcoming: appointments.filter(apt => apt.date >= today && apt.status !== 'cancelled' && apt.status !== 'completed').length,
      pending: appointments.filter(apt => apt.status === 'pending').length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
      cancelled: appointments.filter(apt => apt.status === 'cancelled').length
    };
  };

  const openViewModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
    setMessage('');
  };

  const openEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setEditFormData({
      status: appointment.status,
      notes: appointment.notes || '',
      date: appointment.date,
      time: appointment.time
    });
    setIsEditModalOpen(true);
    setMessage('');
  };

  const handleEditAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const response = await fetch(`http://localhost:5000/appointments/${selectedAppointment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editFormData.status,
          notes: editFormData.notes,
          date: editFormData.date,
          time: editFormData.time
        }),
      });

      if (response.ok) {
        setMessage('Appointment updated successfully!');
        setIsEditModalOpen(false);
        setSelectedAppointment(null);
        fetchData();
      } else {
        setMessage('Failed to update appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      setMessage('Failed to update appointment. Please try again.');
    }
  };

  const handleDeleteAppointment = async (appointment) => {
    if (!confirm(`Are you sure you want to delete this appointment?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/appointments/${appointment.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Appointment deleted successfully!');
        fetchData();
      } else {
        setMessage('Failed to delete appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setMessage('Failed to delete appointment. Please try again.');
    }
  };

  const stats = getStatusStats();

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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>📅 All Appointments</h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          View and manage all appointments in the system.
        </p>
      </div>

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <Card style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.total}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Total</div>
        </Card>
        <Card style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{stats.today}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Today</div>
        </Card>
        <Card style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.upcoming}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Upcoming</div>
        </Card>
        <Card style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pending}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Pending</div>
        </Card>
        <Card style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6366f1' }}>{stats.completed}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Completed</div>
        </Card>
        <Card style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{stats.cancelled}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Cancelled</div>
        </Card>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
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
                placeholder="Search appointments..."
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
                Filter by status
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Filter by date
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
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="upcoming">Upcoming</option>
                <option value="today">Today</option>
                <option value="past">Past</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="all">All Appointments</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

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
            { key: 'today', label: 'Today' },
            { key: 'pending', label: 'Pending' },
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
      {getFilteredAppointments().length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ color: '#9ca3af', marginBottom: '16px' }}>
            <span style={{ fontSize: '48px' }}>📅</span>
          </div>
          <p style={{ color: '#6b7280' }}>
            {filter === 'upcoming' && 'No upcoming appointments'}
            {filter === 'today' && 'No appointments today'}
            {filter === 'pending' && 'No pending appointments'}
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
                        <span style={{ fontSize: '20px' }}>📅</span>
                      </div>
                      <div style={{ flex: '1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                          <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                              👤 {appointment.patient?.name} with 👨‍⚕️ {appointment.doctor?.name}
                            </h3>
                            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                              👤 Patient: {appointment.patient?.email} • 📞 {appointment.patient?.phone}
                            </p>
                            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                              👨‍⚕️ Doctor: {appointment.doctor?.specialization}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '4px' }}>📅</span>
                            {new Date(appointment.date).toLocaleDateString()}
                            {isToday(appointment.date) && (
                              <span style={{ marginLeft: '4px', color: '#2563eb', fontWeight: '600' }}>(Today)</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '4px' }}>⏰</span>
                            {appointment.time}
                          </div>
                        </div>
                        {appointment.reason && (
                          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '500' }}>Reason:</span> {appointment.reason}
                          </p>
                        )}
                        {appointment.notes && (
                          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '500' }}>Notes:</span> {appointment.notes}
                          </p>
                        )}
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                          Created: {new Date(appointment.createdAt).toLocaleDateString()}
                        </div>
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
                      style={{ 
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
                      onClick={() => openEditModal(appointment)}
                      style={{ 
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
                      onClick={() => handleDeleteAppointment(appointment)}
                      style={{ 
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

      {/* View Appointment Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedAppointment(null);
        }}
        title="👁️ Appointment Details"
        size="large"
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
                <span style={{ fontSize: '32px' }}>📅</span>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                Appointment #{selectedAppointment.id}
              </h3>
              <p style={{ fontSize: '18px', color: '#2563eb', fontWeight: '600' }}>
                {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
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
                  <span style={{ fontSize: '20px' }}>👤</span>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0c4a6e' }}>Patient</h4>
                </div>
                <p style={{ fontSize: '14px', color: '#075985', marginBottom: '4px' }}>{selectedAppointment.patient?.name}</p>
                <p style={{ fontSize: '12px', color: '#0369a1' }}>{selectedAppointment.patient?.email}</p>
                <p style={{ fontSize: '12px', color: '#0369a1' }}>{selectedAppointment.patient?.phone}</p>
              </div>

              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f0fdf4', 
                borderRadius: '12px', 
                border: '1px solid #bbf7d0' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>👨‍⚕️</span>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#14532d' }}>Doctor</h4>
                </div>
                <p style={{ fontSize: '14px', color: '#166534', marginBottom: '4px' }}>{selectedAppointment.doctor?.name}</p>
                <p style={{ fontSize: '12px', color: '#15803d' }}>{selectedAppointment.doctor?.specialization}</p>
              </div>

              <div style={{ 
                padding: '16px', 
                backgroundColor: '#fefce8', 
                borderRadius: '12px', 
                border: '1px solid #fef08a' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📅</span>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#713f12' }}>Date & Time</h4>
                </div>
                <p style={{ fontSize: '14px', color: '#a16207', marginBottom: '4px' }}>
                  📅 {new Date(selectedAppointment.date).toLocaleDateString()}
                </p>
                <p style={{ fontSize: '14px', color: '#a16207' }}>
                  ⏰ {selectedAppointment.time}
                </p>
              </div>

              <div style={{ 
                padding: '16px', 
                backgroundColor: '#faf5ff', 
                borderRadius: '12px', 
                border: '1px solid #e9d5ff' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📋</span>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#581c87' }}>Status</h4>
                </div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
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
                  <span style={{ fontSize: '20px' }}>💬</span>
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
                  <span style={{ fontSize: '20px' }}>📝</span>
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

      {/* Edit Appointment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAppointment(null);
          setEditFormData({ status: '', notes: '', date: '', time: '' });
          setMessage('');
        }}
        title="✏️ Edit Appointment"
        size="large"
      >
        {selectedAppointment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#f9fafb', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb',
              marginBottom: '16px'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                Current Appointment
              </h4>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                👤 {selectedAppointment.patient?.name} with 👨‍⚕️ {selectedAppointment.doctor?.name}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                📅 {new Date(selectedAppointment.date).toLocaleDateString()} at ⏰ {selectedAppointment.time}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Date
                </label>
                <input
                  type="date"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  value={editFormData.date}
                  onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
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
                  Time
                </label>
                <input
                  type="time"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  value={editFormData.time}
                  onChange={(e) => setEditFormData({...editFormData, time: e.target.value})}
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
                Status
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
                value={editFormData.status}
                onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Notes
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
                placeholder="Add any notes about this appointment..."
                value={editFormData.notes}
                onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
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
                onClick={handleEditAppointment}
                disabled={!editFormData.status || !editFormData.date || !editFormData.time}
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
                Update Appointment
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedAppointment(null);
                  setEditFormData({ status: '', notes: '', date: '', time: '' });
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
        )}
      </Modal>
    </div>
  );
};

export default AdminAppointments;