import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [tipsCollapsed, setTipsCollapsed] = useState(true);

  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  const fetchUpcomingAppointments = async () => {
    try {
      const [appointmentsRes, doctorsRes] = await Promise.all([
        fetch(`http://localhost:5000/appointments?patientId=${user.id}&_sort=date&_order=asc`),
        fetch('http://localhost:5000/doctors')
      ]);
      
      const appointments = await appointmentsRes.json();
      const doctors = await doctorsRes.json();
      
      // Filter upcoming appointments and get next 2 for compact view
      const today = new Date().toISOString().split('T')[0];
      const upcoming = appointments
        .filter(apt => apt.date >= today)
        .slice(0, 2);
      
      // Combine appointments with doctor details
      const appointmentsWithDoctors = upcoming.map(apt => {
        const doctor = doctors.find(d => d.id === parseInt(apt.doctorId));
        return { ...apt, doctor };
      });
      
      setUpcomingAppointments(appointmentsWithDoctors);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      case 'completed': return '✅';
      default: return '⏳';
    }
  };

  const openViewModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  // Compact action cards - reduced size and padding
  const quickActions = [
    {
      title: 'Find Doctors',
      icon: (
        <svg style={{ width: '14px', height: '14px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      link: '/patient/doctors',
      color: '#3b82f6'
    },
    {
      title: 'My Appointments',
      icon: (
        <svg style={{ width: '14px', height: '14px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12l4 4m0-4l-4 4m4-4v12" />
        </svg>
      ),
      link: '/patient/appointments',
      color: '#10b981'
    },
    {
      title: 'Quick Book',
      icon: (
        <svg style={{ width: '14px', height: '14px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      link: '/patient/doctors',
      color: '#8b5cf6'
    },
    {
      title: 'Medical History',
      icon: (
        <svg style={{ width: '14px', height: '14px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      link: '/patient/appointments',
      color: '#f59e0b'
    }
  ];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            width: '64px',
            height: '64px',
            border: '4px solid #e5e7eb',
            borderBottom: '4px solid #3b82f6',
            borderRadius: '50%',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '20px 16px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header Section */}
        <div style={{
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '56px',
            width: '56px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            borderRadius: '50%',
            marginBottom: '12px',
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
          }}>
            <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Patient Dashboard
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Welcome back, <span style={{ fontWeight: '600', color: '#3b82f6' }}>{user?.name}</span>! 
            Manage your healthcare journey.
          </p>
        </div>

        {/* Compact Action Cards Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link} style={{ 
              display: 'block', 
              textDecoration: 'none',
              color: 'inherit'
            }}>
              <Card style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: '12px',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '32px',
                  width: '32px',
                  backgroundColor: action.color,
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  {action.icon}
                </div>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: 0 }}>{action.title}</h3>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content - Appointments Focus */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Upcoming Appointments - Main Focus */}
          <Card>
            <div style={{
              padding: '16px 16px 12px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  height: '32px',
                  width: '32px',
                  background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12l4 4m0-4l-4 4m4-4v12" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Upcoming Appointments</h2>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Your next visits</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/patient/doctors">
                  <Button size="small" style={{ fontSize: '12px', padding: '6px 10px' }}>
                    Book new
                  </Button>
                </Link>
                <Link to="/patient/appointments">
                  <Button variant="outline" size="small" style={{ fontSize: '12px', padding: '6px 10px' }}>
                    View all →
                  </Button>
                </Link>
              </div>
            </div>

            <div style={{ padding: '16px' }}>
              {upcomingAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                  <div style={{
                    height: '48px',
                    width: '48px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}>
                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12l4 4m0-4l-4 4m4-4v12" />
            </svg>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>No upcoming appointments</h3>
                  <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>Book your first appointment to get started</p>
                  <Link to="/patient/doctors">
                    <Button>Book Appointment</Button>
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe'
                    }}>
                      <div style={{
                        flexShrink: 0,
                        height: '36px',
                        width: '36px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>{appointment.doctor.name}</h4>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: '600',
                            backgroundColor: getStatusColor(appointment.status).backgroundColor,
                            color: getStatusColor(appointment.status).color
                          }}>
                            {appointment.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280' }}>
                          <span>{new Date(appointment.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="small"
                        onClick={() => openViewModal(appointment)}
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        Details
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Right Panel - Collapsible Health Tips */}
          <div>
            <Card>
              <div style={{
                padding: '16px 16px 12px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    height: '28px',
                    width: '28px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg style={{ width: '14px', height: '14px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Health Tips</h3>
                </div>
              </div>
              
              <div style={{ padding: '16px' }}>
                {/* First tip always visible */}
                <div style={{
                  padding: '12px',
                  backgroundColor: '#d1fae5',
                  borderRadius: '8px',
                  border: '1px solid #a7f3d0',
                  marginBottom: tipsCollapsed ? '12px' : '0'
                }}>
                  <h4 style={{ fontWeight: '600', color: '#065f46', marginBottom: '4px', fontSize: '14px' }}>
                    <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg> Stay Hydrated
                  </h4>
                  <p style={{ fontSize: '12px', color: '#047857' }}>Drink at least 8 glasses of water daily.</p>
                </div>
                
                {/* Additional tips - only show when expanded */}
                {tipsCollapsed && (
                  <>
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#dbeafe',
                      borderRadius: '8px',
                      border: '1px solid #93c5fd',
                      marginBottom: '12px'
                    }}>
                      <h4 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '4px', fontSize: '14px' }}>
                        <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg> Regular Exercise
                      </h4>
                      <p style={{ fontSize: '12px', color: '#1d4ed8' }}>Aim for 30 minutes of activity daily.</p>
                    </div>
                    
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#ede9fe',
                      borderRadius: '8px',
                      border: '1px solid #c4b5fd',
                      marginBottom: '16px'
                    }}>
                      <h4 style={{ fontWeight: '600', color: '#6b21a8', marginBottom: '4px', fontSize: '14px' }}>
                        <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg> Quality Sleep
                      </h4>
                      <p style={{ fontSize: '12px', color: '#7c3aed' }}>Get 7-9 hours of sleep each night.</p>
                    </div>
                  </>
                )}
                
                {/* Toggle button */}
                <button
                  onClick={() => setTipsCollapsed(!tipsCollapsed)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tipsCollapsed ? '↓ Show more tips' : '↑ Collapse tips'}
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* Emergency Alert - Footer Style */}
        <div style={{
          backgroundColor: '#fef2f2',
          border: '2px solid #fca5a5',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            height: '32px',
            width: '32px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#991b1b', margin: '0 0 2px 0' }}>Emergency Contact</h4>
            <p style={{ fontSize: '12px', color: '#7f1d1d', margin: 0 }}>For medical emergencies: Call <strong>108</strong> or visit nearest emergency room</p>
          </div>
        </div>

        {/* View Details Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedAppointment(null);
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
                    <svg style={{ width: '16px', height: '16px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12l4 4m0-4l-4 4m4-4v12" />
                    </svg> {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p style={{ fontSize: '14px', color: '#075985' }}>
                    <svg style={{ width: '16px', height: '16px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg> {selectedAppointment.time}
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
                <Link to="/patient/appointments" style={{ flex: 1 }}>
                  <Button
                    style={{ 
                      width: '100%',
                      backgroundColor: '#2563EB',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-5l-5-5v5z" />
                    </svg>
                    View All Appointments
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default PatientDashboard;
