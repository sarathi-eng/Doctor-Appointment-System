import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'patient',
    dateOfBirth: '',
    address: '',
    specialization: '',
    experience: '',
    qualification: '',
    clinicName: ''
  });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
      // Handle registration
      if (registerData.password !== registerData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (!registerData.name || !registerData.email || !registerData.password || !registerData.phone) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const result = await register(registerData);
      
      if (result.success) {
        const userRole = result.user.role;
        let dashboardPath;
        
        switch (userRole) {
          case 'doctor':
            dashboardPath = '/doctor/dashboard';
            break;
          case 'patient':
            dashboardPath = '/patient/dashboard';
            break;
          default:
            dashboardPath = '/';
        }
        
        navigate(dashboardPath);
      } else {
        setError(result.error);
      }
    } else {
      // Handle login
      const result = await login(email, password, false); // false = not demo mode
      
      if (result.success) {
        const userRole = result.user.role;
        let dashboardPath;
        
        switch (userRole) {
          case 'admin':
            dashboardPath = '/admin/dashboard';
            break;
          case 'doctor':
            dashboardPath = '/doctor/dashboard';
            break;
          case 'patient':
            dashboardPath = '/patient/dashboard';
            break;
          default:
            dashboardPath = '/';
        }
        
        navigate(dashboardPath);
      } else {
        setError(result.error);
      }
    }
    
    setLoading(false);
  };

  const fillDemoCredentials = (role) => {
    switch (role) {
      case 'admin':
        setEmail('admin@hospital.com');
        setPassword('Admin@123');
        break;
      case 'doctor':
        setEmail('dr.smith@hospital.com');
        setPassword('Doctor@123');
        break;
      case 'patient':
        setEmail('patient1@email.com');
        setPassword('Patient@123');
        break;
    }
    
    // Auto-login for demo access (bypasses device restrictions)
    handleDemoLogin(role);
  };

  const handleDemoLogin = async (role) => {
    setError('');
    setLoading(true);
    
    let email, password;
    switch (role) {
      case 'admin':
        email = 'admin@hospital.com';
        password = 'Admin@123';
        break;
      case 'doctor':
        email = 'dr.smith@hospital.com';
        password = 'Doctor@123';
        break;
      case 'patient':
        email = 'patient1@email.com';
        password = 'Patient@123';
        break;
    }
    
    const result = await login(email, password, true); // true = demo mode
    
    if (result.success) {
      const userRole = result.user.role;
      let dashboardPath;
      
      switch (userRole) {
        case 'admin':
          dashboardPath = '/admin/dashboard';
          break;
        case 'doctor':
          dashboardPath = '/doctor/dashboard';
          break;
        case 'patient':
          dashboardPath = '/patient/dashboard';
          break;
        default:
          dashboardPath = '/';
      }
      
      navigate(dashboardPath);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const actionCards = [
    {
      role: 'admin',
      title: 'Administrator',
      action: 'Login as Admin',
      description: 'System management and oversight',
      benefits: ['Full system access', 'User management', 'Analytics dashboard'],
      color: '#2563EB',
      borderColor: '#dbeafe'
    },
    {
      role: 'doctor',
      title: 'Doctor',
      action: 'Login as Doctor',
      description: 'View today\'s patients & manage slots',
      benefits: ['Patient management', 'Schedule control', 'Appointment history'],
      color: '#22C55E',
      borderColor: '#d1fae5'
    },
    {
      role: 'patient',
      title: 'Patient',
      action: 'Login as Patient',
      description: 'Book appointments & view history',
      benefits: ['Quick booking', 'Doctor search', 'Appointment tracking'],
      color: '#7c3aed',
      borderColor: '#e9d5ff'
    }
  ];

  const trustSignals = [
    { 
      text: 'Secure booking', 
      icon: (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 0l2.09 6.26L16 8l-6 3.74L11.18 16 8 13.26 4.82 16 6 11.74 0 8l5.91-1.74L8 0z"/>
        </svg>
      )
    },
    { 
      text: 'Real-time slots', 
      icon: (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14C4.27 14 1 10.73 1 8S4.27 2 8 2s7 3.27 7 7-3.27 7-7 7zm.5-9H7V6h1.5V5z"/>
        </svg>
      )
    },
    { 
      text: 'Used by clinics', 
      icon: (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 0L6 2v2H4a1 1 0 00-1 1v1h10V5a1 1 0 00-1-1h-2V2L8 0zm4 8a2 2 0 11-4 0 2 2 0 014 0zm-8 0a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      )
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    }}>
      {/* Left Side - Marketing Content */}
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
              Book appointments faster
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
              Manage clinics smarter
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
              Trusted healthcare scheduling
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

      {/* Right Side - Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Login Header */}
            <div style={{
              padding: '32px 32px 24px',
              textAlign: 'center',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#1e293b', 
                marginBottom: '8px' 
              }}>
                {isRegister ? 'Create Account' : 'Welcome back'}
              </h3>
              <p style={{ 
                fontSize: '14px', 
                color: '#64748b' 
              }}>
                {isRegister ? 'Sign up to get started' : 'Sign in to your account'}
              </p>
              
              {/* Switch between login/register */}
              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                  }}
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
                  {isRegister ? 'Already have an account? Sign in' : 'New user? Create account'}
                </button>
              </div>
              
              {/* Clinic Registration Link */}
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Are you a clinic owner?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/register-clinic')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Register Your Clinic
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
                    fontSize: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}
                
                {/* Name field - only for registration */}
                {isRegister && (
                  <div>
                    <label htmlFor="name" style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={isRegister}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#374151',
                        transition: 'all 0.3s ease',
                        backgroundColor: 'white'
                      }}
                      placeholder="Enter your full name"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
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
                )}
                
                {/* Hidden role field - always patient for registration */}
                {isRegister && (
                  <input
                    type="hidden"
                    name="role"
                    value="patient"
                  />
                )}
                
                <div>
                  <label htmlFor="email" style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  }}>
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'all 0.3s ease',
                      backgroundColor: 'white'
                    }}
                    placeholder="Enter your email"
                    value={isRegister ? registerData.email : email}
                    onChange={(e) => {
                      if (isRegister) {
                        setRegisterData({...registerData, email: e.target.value})
                      } else {
                        setEmail(e.target.value)
                      }
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
                  <label htmlFor="password" style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  }}>
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'all 0.3s ease',
                      backgroundColor: 'white'
                    }}
                    placeholder="Enter your password"
                    value={isRegister ? registerData.password : password}
                    onChange={(e) => {
                      if (isRegister) {
                        setRegisterData({...registerData, password: e.target.value})
                      } else {
                        setPassword(e.target.value)
                      }
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
                
                {/* Confirm Password field - only for registration */}
                {isRegister && (
                  <div>
                    <label htmlFor="confirmPassword" style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required={isRegister}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#374151',
                        transition: 'all 0.3s ease',
                        backgroundColor: 'white'
                      }}
                      placeholder="Confirm your password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
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
                )}
                
                {/* Phone field - only for registration */}
                {isRegister && (
                  <div>
                    <label htmlFor="phone" style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required={isRegister}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#374151',
                        transition: 'all 0.3s ease',
                        backgroundColor: 'white'
                      }}
                      placeholder="Enter your phone number"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
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
                )}
                
                {/* Patient-specific fields */}
                {isRegister && registerData.role === 'patient' && (
                  <>
                    <div>
                      <label htmlFor="dateOfBirth" style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '8px' 
                      }}>
                        Date of Birth
                      </label>
                      <input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        required={isRegister && registerData.role === 'patient'}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '14px',
                          color: '#374151',
                          transition: 'all 0.3s ease',
                          backgroundColor: 'white'
                        }}
                        value={registerData.dateOfBirth}
                        onChange={(e) => setRegisterData({...registerData, dateOfBirth: e.target.value})}
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
                      <label htmlFor="address" style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '8px' 
                      }}>
                        Address
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        required={isRegister && registerData.role === 'patient'}
                        rows="3"
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
                          resize: 'vertical'
                        }}
                        placeholder="Enter your address"
                        value={registerData.address}
                        onChange={(e) => setRegisterData({...registerData, address: e.target.value})}
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
                  </>
                )}
                
                {/* Doctor-specific fields */}
                {isRegister && registerData.role === 'doctor' && (
                  <>
                    <div>
                      <label htmlFor="specialization" style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '8px' 
                      }}>
                        Specialization
                      </label>
                      <input
                        id="specialization"
                        name="specialization"
                        type="text"
                        required={isRegister && registerData.role === 'doctor'}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '14px',
                          color: '#374151',
                          transition: 'all 0.3s ease',
                          backgroundColor: 'white'
                        }}
                        placeholder="e.g., Cardiology, Pediatrics"
                        value={registerData.specialization}
                        onChange={(e) => setRegisterData({...registerData, specialization: e.target.value})}
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
                      <label htmlFor="experience" style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '8px' 
                      }}>
                        Years of Experience
                      </label>
                      <input
                        id="experience"
                        name="experience"
                        type="text"
                        required={isRegister && registerData.role === 'doctor'}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '14px',
                          color: '#374151',
                          transition: 'all 0.3s ease',
                          backgroundColor: 'white'
                        }}
                        placeholder="e.g., 10 years"
                        value={registerData.experience}
                        onChange={(e) => setRegisterData({...registerData, experience: e.target.value})}
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
                      <label htmlFor="qualification" style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '8px' 
                      }}>
                        Qualification
                      </label>
                      <input
                        id="qualification"
                        name="qualification"
                        type="text"
                        required={isRegister && registerData.role === 'doctor'}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '14px',
                          color: '#374151',
                          transition: 'all 0.3s ease',
                          backgroundColor: 'white'
                        }}
                        placeholder="e.g., MD, MBBS, Specialist"
                        value={registerData.qualification}
                        onChange={(e) => setRegisterData({...registerData, qualification: e.target.value})}
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
                      <label htmlFor="clinicName" style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '8px' 
                      }}>
                        Clinic/Hospital Name
                      </label>
                      <input
                        id="clinicName"
                        name="clinicName"
                        type="text"
                        required={isRegister && registerData.role === 'doctor'}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '14px',
                          color: '#374151',
                          transition: 'all 0.3s ease',
                          backgroundColor: 'white'
                        }}
                        placeholder="Enter clinic or hospital name"
                        value={registerData.clinicName}
                        onChange={(e) => setRegisterData({...registerData, clinicName: e.target.value})}
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
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
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
                    background: '#2563EB',
                    transition: 'all 0.3s ease',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.background = '#1d4ed8';
                      e.target.style.boxShadow = '0 0 20px rgba(37, 99, 235, 0.4)';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.background = '#2563EB';
                      e.target.style.boxShadow = 'none';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                  onMouseDown={(e) => {
                    if (!loading) {
                      const ripple = document.createElement('span');
                      ripple.style.position = 'absolute';
                      ripple.style.borderRadius = '50%';
                      ripple.style.background = 'rgba(255, 255, 255, 0.6)';
                      ripple.style.transform = 'scale(0)';
                      ripple.style.animation = 'ripple 0.6s linear';
                      ripple.style.left = (e.clientX - e.target.offsetLeft) + 'px';
                      ripple.style.top = (e.clientY - e.target.offsetTop) + 'px';
                      ripple.style.width = '20px';
                      ripple.style.height = '20px';
                      e.target.appendChild(ripple);
                      setTimeout(() => ripple.remove(), 600);
                    }
                  }}
                >
                  {loading ? (isRegister ? 'Creating account...' : 'Signing in...') : (isRegister ? 'Create Account' : 'Sign in')}
                </button>
              </form>
            </div>
          </div>

          {/* Action Cards - Only show for login */}
          {!isRegister && (
            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                Quick demo access
              </p>
              {actionCards.map((card) => (
                <button
                  key={card.role}
                  type="button"
                  onClick={() => fillDemoCredentials(card.role)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: `2px solid ${card.borderColor}`,
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.borderColor = card.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = card.borderColor;
                  }}
                  onMouseDown={(e) => {
                    const ripple = document.createElement('span');
                    ripple.style.position = 'absolute';
                    ripple.style.borderRadius = '50%';
                    ripple.style.background = `${card.color}20`;
                    ripple.style.transform = 'scale(0)';
                    ripple.style.animation = 'ripple 0.6s linear';
                    ripple.style.left = (e.clientX - e.currentTarget.offsetLeft) + 'px';
                    ripple.style.top = (e.clientY - e.currentTarget.offsetTop) + 'px';
                    ripple.style.width = '20px';
                    ripple.style.height = '20px';
                    e.currentTarget.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 600);
                  }}
                >
                  <div style={{
                    height: '40px',
                    width: '40px',
                    background: card.color,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    flexShrink: 0
                  }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      background: 'white',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: card.color
                    }}>
                      {card.title.charAt(0)}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      marginBottom: '2px'
                    }}>
                      {card.action} →
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#64748b' 
                    }}>
                      {card.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ripple Animation Styles */}
      <style>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;