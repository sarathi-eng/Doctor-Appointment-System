import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin, isDoctor, isPatient } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isDoctor) return '/doctor/dashboard';
    if (isPatient) return '/patient/dashboard';
    return '/';
  };

  const getRoleIcon = () => {
    if (isAdmin) return '⚙️';
    if (isDoctor) return '👨‍⚕️';
    if (isPatient) return '👤';
    return '👤';
  };

  const getRoleColor = () => {
    if (isAdmin) return {
      backgroundColor: '#f3e8ff',
      color: '#6b21a8',
      borderColor: '#c4b5fd'
    };
    if (isDoctor) return {
      backgroundColor: '#dcfce7',
      color: '#166534',
      borderColor: '#a7f3d0'
    };
    if (isPatient) return {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      borderColor: '#93c5fd'
    };
    return {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      borderColor: '#d1d5db'
    };
  };

  const roleStyles = getRoleColor();

  return (
    <nav style={{
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
      position: 'sticky',
      top: '0',
      zIndex: '50',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to={getDashboardLink()} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '20px',
              fontWeight: '700',
              color: '#111827',
              textDecoration: 'none'
            }}>
              <div style={{
                height: '40px',
                width: '40px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>DC</span>
              </div>
              <span style={{
                fontSize: '20px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                DoctorCare
              </span>
            </Link>
            
            {user && (
              <div style={{
                display: 'none',
                marginLeft: '32px',
                gap: '4px'
              }} className="desktop-nav">
                {isAdmin && (
                  <>
                    <Link to="/admin/dashboard" style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#4b5563',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      position: 'relative',
                      padding: '8px 12px',
                      borderRadius: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#4b5563';
                    }}>
                      Dashboard
                    </Link>
                    <Link to="/admin/doctors" style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#4b5563',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      position: 'relative',
                      padding: '8px 12px',
                      borderRadius: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#4b5563';
                    }}>
                      Manage Doctors
                    </Link>
                    <Link to="/admin/appointments" style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#4b5563',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      position: 'relative',
                      padding: '8px 12px',
                      borderRadius: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#4b5563';
                    }}>
                      All Appointments
                    </Link>
                  </>
                )}
                
                {isDoctor && (
                  <>
                    <Link to="/doctor/dashboard" style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#4b5563',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      position: 'relative',
                      padding: '8px 12px',
                      borderRadius: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#4b5563';
                    }}>
                      Dashboard
                    </Link>
                    <Link to="/doctor/appointments" style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#4b5563',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      position: 'relative',
                      padding: '8px 12px',
                      borderRadius: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#4b5563';
                    }}>
                      My Appointments
                    </Link>
                    <Link to="/doctor/schedule" style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#4b5563',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      position: 'relative',
                      padding: '8px 12px',
                      borderRadius: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#4b5563';
                    }}>
                      Schedule
                    </Link>
                  </>
                )}
                
                {isPatient && (
                  <>
                    <Link to="/patient/dashboard" style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#4b5563',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      position: 'relative',
                      padding: '8px 12px',
                      borderRadius: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#4b5563';
                    }}>
                      Dashboard
                    </Link>
                    <Link to="/patient/doctors" style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#4b5563',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      position: 'relative',
                      padding: '8px 12px',
                      borderRadius: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#4b5563';
                    }}>
                      Find Doctors
                    </Link>
                    <Link to="/patient/appointments" style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#4b5563',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      position: 'relative',
                      padding: '8px 12px',
                      borderRadius: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#4b5563';
                    }}>
                      My Appointments
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                display: 'none',
                alignItems: 'center',
                gap: '12px'
              }} className="desktop-user-info">
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.email}</div>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '600',
                  border: `1px solid ${roleStyles.borderColor}`,
                  backgroundColor: roleStyles.backgroundColor,
                  color: roleStyles.color
                }}>
                  <span style={{ marginRight: '4px' }}>{getRoleIcon()}</span>
                  <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                style={{
                  display: 'none',
                  alignItems: 'center',
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#9ca3af';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#d1d5db';
                }}
                className="desktop-logout"
              >
                <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>

              {/* Mobile menu button */}
              <div style={{ display: 'block' }} className="mobile-menu-btn">
                <button style={{
                  color: '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#6b7280';
                }}>
                  <svg style={{ height: '24px', width: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation menu */}
      {user && (
        <div style={{
          display: 'none',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)'
        }} className="mobile-menu">
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
              <div style={{
                height: '32px',
                width: '32px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>{getRoleIcon()}</span>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.email}</div>
              </div>
              <div style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '600',
                border: `1px solid ${roleStyles.borderColor}`,
                backgroundColor: roleStyles.backgroundColor,
                color: roleStyles.color
              }}>
                <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#4b5563',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#2563eb';
                    e.target.style.backgroundColor = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#4b5563';
                    e.target.style.backgroundColor = 'transparent';
                  }}>
                    <span style={{ marginRight: '12px' }}>📊</span>
                    Dashboard
                  </Link>
                  <Link to="/admin/doctors" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#4b5563',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#2563eb';
                    e.target.style.backgroundColor = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#4b5563';
                    e.target.style.backgroundColor = 'transparent';
                  }}>
                    <span style={{ marginRight: '12px' }}>👨‍⚕️</span>
                    Manage Doctors
                  </Link>
                  <Link to="/admin/appointments" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#4b5563',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#2563eb';
                    e.target.style.backgroundColor = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#4b5563';
                    e.target.style.backgroundColor = 'transparent';
                  }}>
                    <span style={{ marginRight: '12px' }}>📅</span>
                    All Appointments
                  </Link>
                </>
              )}
              
              {isDoctor && (
                <>
                  <Link to="/doctor/dashboard" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#4b5563',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#2563eb';
                    e.target.style.backgroundColor = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#4b5563';
                    e.target.style.backgroundColor = 'transparent';
                  }}>
                    <span style={{ marginRight: '12px' }}>📊</span>
                    Dashboard
                  </Link>
                  <Link to="/doctor/appointments" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#4b5563',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#2563eb';
                    e.target.style.backgroundColor = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#4b5563';
                    e.target.style.backgroundColor = 'transparent';
                  }}>
                    <span style={{ marginRight: '12px' }}>📅</span>
                    My Appointments
                  </Link>
                  <Link to="/doctor/schedule" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#4b5563',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#2563eb';
                    e.target.style.backgroundColor = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#4b5563';
                    e.target.style.backgroundColor = 'transparent';
                  }}>
                    <span style={{ marginRight: '12px' }}>⏰</span>
                    Schedule
                  </Link>
                </>
              )}
              
              {isPatient && (
                <>
                  <Link to="/patient/dashboard" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#4b5563',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#2563eb';
                    e.target.style.backgroundColor = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#4b5563';
                    e.target.style.backgroundColor = 'transparent';
                  }}>
                    <span style={{ marginRight: '12px' }}>📊</span>
                    Dashboard
                  </Link>
                  <Link to="/patient/doctors" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#4b5563',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#2563eb';
                    e.target.style.backgroundColor = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#4b5563';
                    e.target.style.backgroundColor = 'transparent';
                  }}>
                    <span style={{ marginRight: '12px' }}>🔍</span>
                    Find Doctors
                  </Link>
                  <Link to="/patient/appointments" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#4b5563',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#2563eb';
                    e.target.style.backgroundColor = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#4b5563';
                    e.target.style.backgroundColor = 'transparent';
                  }}>
                    <span style={{ marginRight: '12px' }}>📅</span>
                    My Appointments
                  </Link>
                </>
              )}
              
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#dc2626',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#b91c1c';
                  e.target.style.backgroundColor = '#fef2f2';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#dc2626';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <svg style={{ width: '16px', height: '16px', marginRight: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-user-info {
            display: flex !important;
          }
          .desktop-logout {
            display: inline-flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        
        @media (max-width: 767px) {
          .mobile-menu {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;