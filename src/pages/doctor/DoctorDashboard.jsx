import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [tipsCollapsed, setTipsCollapsed] = useState(true);
  const [stats, setStats] = useState({
    todayCount: 0,
    upcomingCount: 0,
    totalPatients: 0,
    completedToday: 0
  });

  useEffect(() => {
    if (user) {
      fetchDoctorData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDoctorData = async () => {
    try {
      // First, find the doctor record for this user
      const doctorResponse = await fetch(`http://localhost:5000/doctors?userId=${user.id}`);
      
      if (!doctorResponse.ok) {
        throw new Error(`Failed to fetch doctor data: ${doctorResponse.status}`);
      }
      
      const doctorData = await doctorResponse.json();
      
      if (doctorData.length === 0) {
        setTodayAppointments([]);
        setUpcomingAppointments([]);
        setStats({
          todayCount: 0,
          upcomingCount: 0,
          totalPatients: 0,
          completedToday: 0
        });
        setLoading(false);
        return;
      }
      
      const doctor = doctorData[0];
      
      // Fetch today's appointments using the mapped doctor ID
      const today = new Date().toISOString().split('T')[0];
      
      const todayResponse = await fetch(`http://localhost:5000/appointments?doctorId=${doctor.id}&date=${today}&_sort=time&_order=asc`);
      const todayAppts = await todayResponse.json();
      setTodayAppointments(todayAppts);

      // Fetch upcoming appointments (excluding today) using the mapped doctor ID
      const upcomingResponse = await fetch(`http://localhost:5000/appointments?doctorId=${doctor.id}&date_gte=${today}&_sort=date&_order=asc`);
      const upcomingAppts = await upcomingResponse.json();
      const futureAppts = upcomingAppts.filter(apt => apt.date > today);
      setUpcomingAppointments(futureAppts.slice(0, 5));

      // Calculate stats
      const completedToday = todayAppts.filter(apt => apt.status === 'completed').length;
      const uniquePatients = new Set(todayAppts.map(apt => apt.patientId)).size;

      setStats({
        todayCount: todayAppts.length,
        upcomingCount: upcomingAppts.length,
        totalPatients: uniquePatients,
        completedToday
      });

    } catch (error) {
      console.error('Error fetching doctor data:', error);
      // Set empty data on error to prevent infinite loading
      setTodayAppointments([]);
      setUpcomingAppointments([]);
      setStats({
        todayCount: 0,
        upcomingCount: 0,
        totalPatients: 0,
        completedToday: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await fetch(`http://localhost:5000/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      // Refresh data
      fetchDoctorData();
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return (
        <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case 'pending': return (
        <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case 'cancelled': return (
        <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
      case 'completed': return (
        <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      default: return (
        <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef2f2',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{
            marginBottom: '16px'
          }}>
            <svg style={{ width: '48px', height: '48px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 style={{ color: '#991b1b', marginBottom: '12px' }}>Authentication Error</h2>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>No user found. Please log in again.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

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
            borderBottom: '4px solid #10b981',
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
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header Section */}
        <div style={{
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60px',
            width: '60px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            marginBottom: '16px',
            boxShadow: '0 12px 24px rgba(16, 185, 129, 0.3)'
          }}>
            <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Doctor Dashboard
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280'
          }}>
            Welcome back, <span style={{ fontWeight: '600', color: '#10b981' }}>Dr. {user?.name}</span>! 
            Manage your appointments and patient care.
          </p>
        </div>

        {/* Overview Section - Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <Card>
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '48px',
                width: '48px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '50%',
                marginBottom: '12px',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
              }}>
                <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12l4 4m0-4l-4 4m4-4v12" />
                </svg>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>{stats.todayCount}</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Today's Appointments</p>
            </div>
          </Card>

          <Card>
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '48px',
                width: '48px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '50%',
                marginBottom: '12px',
                boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
              }}>
                <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-5l-5-5v5z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>{stats.upcomingCount}</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Upcoming Appointments</p>
            </div>
          </Card>

          <Card>
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '48px',
                width: '48px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                marginBottom: '12px',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
              }}>
                <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>{stats.completedToday}</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Completed Today</p>
            </div>
          </Card>

          <Card>
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '48px',
                width: '48px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '50%',
                marginBottom: '12px',
                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
              }}>
                <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>{stats.totalPatients}</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Today's Patients</p>
            </div>
          </Card>
        </div>

        {/* Today Section - Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Today's Appointments */}
          <div>
            <Card>
              <div style={{
                padding: '20px 20px 16px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    height: '40px',
                    width: '40px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg style={{ width: '18px', height: '18px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12l4 4m0-4l-4 4m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Today's Schedule</h2>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '4px 12px',
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  borderRadius: '20px',
                  border: '1px solid #93c5fd'
                }}>
                  {todayAppointments.length} appointments
                </span>
              </div>

              <div style={{ padding: '16px 20px 20px' }}>
                {todayAppointments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{
                      height: '80px',
                      width: '80px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}>
                      <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12l4 4m0-4l-4 4m4-4v12" />
                      </svg>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>No appointments today</h3>
                    <p style={{ color: '#6b7280' }}>Take some time to relax or review patient records</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {todayAppointments.map((appointment, index) => (
                      <div key={appointment.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        borderRadius: '12px',
                        border: '1px solid #bbf7d0',
                        transition: 'all 0.2s ease'
                      }}>
                        <div style={{
                          flexShrink: 0,
                          height: '44px',
                          width: '44px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '16px',
                          boxShadow: '0 3px 10px rgba(16, 185, 129, 0.3)'
                        }}>
                          <svg style={{ width: '18px', height: '18px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div>
                              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '2px' }}>
                                Patient #{appointment.patientId}
                              </h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#6b7280' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                                  {appointment.time}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                                  {appointment.reason}
                                </div>
                              </div>
                            </div>
                            <span className={`status-badge ${getStatusColor(appointment.status)}`} style={{ fontSize: '11px' }}>
                              <svg style={{ width: '12px', height: '12px', marginRight: '3px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {appointment.status === 'confirmed' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                              {appointment.status === 'pending' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                              {appointment.status === 'cancelled' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />}
                              {appointment.status === 'completed' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                            </svg>
                              {appointment.status}
                            </span>
                          </div>
                          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {appointment.status === 'pending' && (
                                <Button
                                  size="small"
                                  onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', fontSize: '12px', padding: '6px 10px' }}
                                >
                                  <svg style={{ width: '12px', height: '12px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg> Confirm
                                </Button>
                              )}
                              <Button
                                size="small"
                                variant="outline"
                                onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                style={{ borderColor: '#10b981', color: '#10b981', fontSize: '12px', padding: '6px 10px' }}
                              >
                                <svg style={{ width: '12px', height: '12px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg> Complete
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Panel */}
          <Card>
            {/* Quick Actions */}
            <div style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  height: '36px',
                  width: '36px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Quick Actions</h3>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>Common tasks</p>
                </div>
              </div>
              <div style={{ padding: '16px 0 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    color: '#065f46',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-5l-5-5v5z" />
                    </svg>
                    View All Appointments →
                  </button>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    color: '#1e40af',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Manage Schedule →
                  </button>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    backgroundColor: '#fefce8',
                    border: '1px solid #fef08a',
                    borderRadius: '8px',
                    color: '#854d0e',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Patient Reports →
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <button
                onClick={() => setActiveTab('appointments')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: activeTab === 'appointments' ? '#ffffff' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'appointments' ? '2px solid #10b981' : 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: activeTab === 'appointments' ? '#10b981' : '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg style={{ width: '16px', height: '16px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12l4 4m0-4l-4 4m4-4v12" />
                </svg> Next Appointments
              </button>
              <button
                onClick={() => setActiveTab('tips')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: activeTab === 'tips' ? '#ffffff' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'tips' ? '2px solid #10b981' : 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: activeTab === 'tips' ? '#10b981' : '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg style={{ width: '16px', height: '16px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg> Tips
              </button>
            </div>
            
            {/* Tab Content */}
            <div style={{ padding: '20px' }}>
              {activeTab === 'appointments' && (
                <div>
                  {upcomingAppointments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                      <p style={{ color: '#6b7280', fontSize: '14px' }}>No upcoming appointments</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '12px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{
                            flexShrink: 0,
                            height: '32px',
                            width: '32px',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg style={{ width: '14px', height: '14px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>Patient #{appointment.patientId}</p>
                            <p style={{ fontSize: '12px', color: '#6b7280' }}>
                              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                            </p>
                          </div>
                          <span className={`status-badge ${getStatusColor(appointment.status)}`} style={{ fontSize: '10px' }}>
                            {appointment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'tips' && (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      padding: '12px',
                      backgroundColor: tipsCollapsed ? '#f0fdf4' : '#ecfeff',
                      borderRadius: '8px',
                      border: '1px solid #bbf7d0',
                      marginBottom: tipsCollapsed ? '12px' : '0'
                    }}>
                      <h4 style={{ fontWeight: '600', color: '#166534', marginBottom: '4px', fontSize: '14px' }}>
                        <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg> Patient Records
                      </h4>
                      <p style={{ fontSize: '12px', color: '#15803d' }}>Always review patient history before appointments.</p>
                    </div>
                    
                    {tipsCollapsed && (
                      <>
                        <div style={{
                          padding: '12px',
                          backgroundColor: '#f0fdf4',
                          borderRadius: '8px',
                          border: '1px solid #bbf7d0',
                          marginBottom: '12px'
                        }}>
                          <h4 style={{ fontWeight: '600', color: '#166534', marginBottom: '4px', fontSize: '14px' }}>
                            <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg> Time Management
                          </h4>
                          <p style={{ fontSize: '12px', color: '#15803d' }}>Stick to appointment times for better scheduling.</p>
                        </div>
                        
                        <div style={{
                          padding: '12px',
                          backgroundColor: '#f0fdf4',
                          borderRadius: '8px',
                          border: '1px solid #bbf7d0',
                          marginBottom: '16px'
                        }}>
                          <h4 style={{ fontWeight: '600', color: '#166534', marginBottom: '4px', fontSize: '14px' }}>
                            <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                            </svg> Communication
                          </h4>
                          <p style={{ fontSize: '12px', color: '#15803d' }}>Clear communication builds patient trust.</p>
                        </div>
                      </>
                    )}
                    
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
                      {tipsCollapsed ? '↓ View all tips' : '↑ Collapse tips'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;