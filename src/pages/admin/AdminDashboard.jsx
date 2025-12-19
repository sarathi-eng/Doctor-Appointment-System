import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clinicInfo, setClinicInfo] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch clinic info for current admin
      const clinicRes = await fetch('http://localhost:5000/clinics');
      const clinics = await clinicRes.json();
      const currentClinic = clinics.find(clinic => clinic.adminId === user.id);
      
      if (!currentClinic) {
        console.error('No clinic found for this admin');
        setLoading(false);
        return;
      }
      
      setClinicInfo(currentClinic);
      
      // Fetch clinic-specific data
      const [doctorsRes, appointmentsRes] = await Promise.all([
        fetch(`http://localhost:5000/doctors?clinicId=${currentClinic.id}`),
        fetch(`http://localhost:5000/appointments?clinicId=${currentClinic.id}`)
      ]);

      const doctors = await doctorsRes.json();
      const appointments = await appointmentsRes.json();

      // Fetch patients who have appointments in this clinic
      const patientIds = [...new Set(appointments.map(apt => apt.patientId))];
      const patients = [];
      
      if (patientIds.length > 0) {
        const patientsPromises = patientIds.map(id => 
          fetch(`http://localhost:5000/users?id=${id}&role=patient`)
            .then(res => res.json())
            .catch(() => [])
        );
        const patientsData = await Promise.all(patientsPromises);
        patients.push(...patientsData.flat());
      }

      // Calculate today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(apt => apt.date === today);

      // Calculate appointment statuses
      const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
      const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');

      setStats({
        totalDoctors: doctors.length,
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        todayAppointments: todayAppointments.length,
        pendingAppointments: pendingAppointments.length,
        confirmedAppointments: confirmedAppointments.length
      });

      // Get recent activity (last 5 appointments)
      const recentAppointments = appointments
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date);
          const dateB = new Date(b.createdAt || b.date);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);

      // Enhance with doctor and patient info
      const recentWithDetails = recentAppointments.map((apt) => {
        const doctor = doctors.find(d => d.id == apt.doctorId || d.id == String(apt.doctorId));
        const patient = patients.find(p => p.id == apt.patientId || p.id == String(apt.patientId));

        return { ...apt, doctor, patient };
      });

      setRecentActivity(recentWithDetails);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      case 'completed': return '#3b82f6';
      default: return '#f59e0b';
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

  const quickActions = [
    {
      title: 'Add New Doctor',
      description: 'Expand your medical team',
      icon: (
        <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      link: '/admin/doctors',
      action: 'Add Doctor',
      color: '#2563EB'
    },
    {
      title: 'Review All Appointments',
      description: 'Manage today\'s schedule',
      icon: (
        <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      link: '/admin/appointments',
      action: 'View Schedule',
      color: '#22C55E'
    }
  ];

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
            borderBottom: '4px solid #2563EB',
            borderRadius: '50%',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading dashboard...</p>
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
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        {/* Header Section */}
        <div style={{
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80px',
            width: '80px',
            background: '#2563EB',
            borderRadius: '50%',
            marginBottom: '24px',
            boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)'
          }}>
            <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '16px'
          }}>
            {clinicInfo?.name || 'Admin'} Dashboard
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Welcome back, <span style={{ fontWeight: '600', color: '#2563EB' }}>{user?.name}</span>! 
            Manage your clinic's healthcare operations efficiently.
          </p>
          {clinicInfo && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '20px',
              marginTop: '16px',
              fontSize: '14px',
              color: '#0c4a6e'
            }}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {clinicInfo.address}
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {/* Big Card - Total Appointments */}
          <Card style={{
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '1px solid #e5e7eb'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '80px',
                width: '80px',
                background: '#2563EB',
                borderRadius: '50%',
                marginBottom: '24px',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
                transition: 'transform 0.3s ease'
              }}>
                <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-5l-5-5v5z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '48px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>{stats.totalAppointments}</h3>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#2563EB', marginBottom: '12px' }}>Total Appointments</p>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>All appointments in system</p>
              <a href="/admin/appointments" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                View All Appointments →
              </a>
            </div>
          </Card>

          {/* Big Card - Today's Appointments */}
          <Card style={{
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '1px solid #e5e7eb'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '80px',
                width: '80px',
                background: '#22C55E',
                borderRadius: '50%',
                marginBottom: '24px',
                boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)',
                transition: 'transform 0.3s ease'
              }}>
                <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '48px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>{stats.todayAppointments}</h3>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#22C55E', marginBottom: '12px' }}>Today's Appointments</p>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Scheduled for today</p>
              <a href="/admin/appointments" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Manage Schedule →
              </a>
            </div>
          </Card>

          {/* Small Cards */}
          <Card style={{
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '1px solid #e5e7eb'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '56px',
                width: '56px',
                background: '#8b5cf6',
                borderRadius: '50%',
                marginBottom: '16px',
                boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)',
                transition: 'transform 0.3s ease'
              }}>
                <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{stats.totalDoctors}</h3>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#2563EB', marginBottom: '8px' }}>Doctors</p>
              <a href="/admin/doctors" style={{
                fontSize: '12px',
                color: '#6b7280',
                textDecoration: 'none'
              }}>
                Manage team →
              </a>
            </div>
          </Card>

          <Card style={{
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '1px solid #e5e7eb'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '56px',
                width: '56px',
                background: '#f59e0b',
                borderRadius: '50%',
                marginBottom: '16px',
                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
                transition: 'transform 0.3s ease'
              }}>
                <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{stats.totalPatients}</h3>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#22C55E', marginBottom: '8px' }}>Patients</p>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Registered users</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {quickActions.map((action, index) => (
            <Card key={index} style={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}>
              <a href={action.link} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '72px',
                    width: '72px',
                    background: action.color,
                    borderRadius: '20px',
                    marginBottom: '24px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                    transition: 'transform 0.3s ease'
                  }}>
                    <div style={{ color: 'white' }}>{action.icon}</div>
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>{action.title}</h3>
                  <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '12px' }}>{action.description}</p>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    backgroundColor: `${action.color}10`,
                    borderRadius: '20px',
                    border: `1px solid ${action.color}20`,
                    fontSize: '14px',
                    fontWeight: '500',
                    color: action.color
                  }}>
                    {action.secondaryText} →
                  </div>
                </div>
              </a>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '32px'
        }}>
          {/* Recent Activity */}
          <div>
            <Card style={{ border: '1px solid #e5e7eb', backgroundColor: 'white' }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    height: '40px',
                    width: '40px',
                    background: '#2563EB',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg style={{ width: '18px', height: '18px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-5l-5-5v5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Recent Activity</h2>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Latest appointments and updates</p>
                  </div>
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '4px 12px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  borderRadius: '20px',
                  border: '1px solid #d1d5db'
                }}>
                  {recentActivity.length} items
                </span>
              </div>

              <div style={{ padding: '24px' }}>
                {recentActivity.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                    <div style={{
                      height: '120px',
                      width: '120px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                      border: '2px dashed #e2e8f0'
                    }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>No recent activity</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>Activity will appear here as appointments are created</p>
                    <Button 
                      style={{
                        backgroundColor: '#2563EB',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#1d4ed8';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#2563EB';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Add First Appointment
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {recentActivity.map((activity, index) => (
                      <div key={activity.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '20px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                        <div style={{
                          flexShrink: 0,
                          height: '56px',
                          width: '56px',
                          background: getStatusColor(activity.status),
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '20px',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)'
                        }}>
                          <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div>
                              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                                {activity.doctor?.name || 'Unknown Doctor'} - Patient #{activity.patientId}
                              </h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {new Date(activity.date).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {activity.time}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  {activity.reason}
                                </div>
                              </div>
                            </div>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              padding: '4px 12px',
                              backgroundColor: `${getStatusColor(activity.status)}15`,
                              color: getStatusColor(activity.status),
                              borderRadius: '20px',
                              border: `1px solid ${getStatusColor(activity.status)}20`
                            }}>
                              <span style={{ marginRight: '4px' }}>{getStatusIcon(activity.status)}</span>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Appointment Status Summary */}
            <Card style={{ border: '1px solid #e5e7eb', backgroundColor: 'white' }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  height: '40px',
                  width: '40px',
                  background: '#22C55E',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '18px', height: '18px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Appointment Status</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Current overview</p>
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '12px',
                    border: '1px solid #fde68a'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        height: '32px',
                        width: '32px',
                        background: '#f59e0b',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg style={{ width: '14px', height: '14px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span style={{ fontWeight: '600', color: '#92400e' }}>Pending</span>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#d97706' }}>{stats.pendingAppointments}</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#d1fae5',
                    borderRadius: '12px',
                    border: '1px solid #a7f3d0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        height: '32px',
                        width: '32px',
                        background: '#22C55E',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg style={{ width: '14px', height: '14px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span style={{ fontWeight: '600', color: '#065f46' }}>Confirmed</span>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>{stats.confirmedAppointments}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* System Health */}
            <Card style={{ border: '1px solid #e5e7eb', backgroundColor: 'white' }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  height: '40px',
                  width: '40px',
                  background: '#06b6d4',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '18px', height: '18px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>System Health</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Performance metrics</p>
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#d1fae5',
                    borderRadius: '12px',
                    border: '1px solid #a7f3d0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#065f46' }}>Server Status</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                        <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg> Online
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#a7f3d0', borderRadius: '4px' }}>
                      <div style={{ width: '100%', height: '100%', backgroundColor: '#10b981', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  <div style={{
                    padding: '16px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '12px',
                    border: '1px solid #93c5fd'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#1e40af' }}>Database</span>
                      <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                        <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg> Connected
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#93c5fd', borderRadius: '4px' }}>
                      <div style={{ width: '100%', height: '100%', backgroundColor: '#3b82f6', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  <div style={{
                    padding: '16px',
                    backgroundColor: '#ede9fe',
                    borderRadius: '12px',
                    border: '1px solid #c4b5fd'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#6b21a8' }}>API Response</span>
                      <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>
                        <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg> Fast
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#c4b5fd', borderRadius: '4px' }}>
                      <div style={{ width: '95%', height: '100%', backgroundColor: '#8b5cf6', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card style={{ border: '1px solid #e5e7eb', backgroundColor: 'white' }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  height: '40px',
                  width: '40px',
                  background: '#f59e0b',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '18px', height: '18px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Today's Summary</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Key metrics</p>
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>{stats.todayAppointments}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Appointments</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                      {Math.round((stats.totalAppointments / Math.max(stats.totalPatients, 1)) * 10) / 10}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Avg per Patient</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;