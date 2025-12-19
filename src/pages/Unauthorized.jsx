import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ maxWidth: '448px', width: '100%', textAlign: 'center' }}>
        <div>
          <h2 style={{
            fontSize: '60px',
            fontWeight: 'bold',
            color: '#d1d5db',
            marginBottom: '8px'
          }}>403</h2>
          <h2 style={{
            fontSize: '30px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Unauthorized Access
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '32px'
          }}>
            You don't have permission to access this page.
          </p>
        </div>
        <div>
          <Link
            to="/login"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              padding: '8px 16px',
              border: '1px solid transparent',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'white',
              backgroundColor: '#3b82f6',
              textDecoration: 'none',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
            }}
          >
            Go back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;