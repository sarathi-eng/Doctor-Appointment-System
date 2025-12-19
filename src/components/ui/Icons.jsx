// SVG Icons for the application
import React from 'react';

export const Icon = ({ name, size = 16, color = 'currentColor', className = '' }) => {
  const icons = {
    calendar: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M1 2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
      </svg>
    ),
    doctor: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M8 0L6 2v2H4a1 1 0 0 0-1 1v1h10V5a1 1 0 0 0-1-1h-2V2L8 0zm4 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
        <circle cx="6" cy="8" r="1"/>
        <circle cx="10" cy="8" r="1"/>
      </svg>
    ),
    person: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 2c2.67 0 8 1.33 8 4v4H0v-4c0-2.67 5.33-4 8-4z"/>
      </svg>
    ),
    phone: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M11.5 0h-7A1.5 1.5 0 0 0 3 1.5v13A1.5 1.5 0 0 0 4.5 16h7a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 11.5 0zM8 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
      </svg>
    ),
    email: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M16 4H0C0 2.9 0.9 2 2 2h12c1.1 0 2 0.9 2 2v12H0V4h16v12H4V6l6 4.5L16 6V4z"/>
      </svg>
    ),
    eye: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M8 4C5.2 4 2.8 5.6 1.2 8c1.6 2.4 4 4 6.8 4s5.2-1.6 6.8-4C13.2 5.6 10.8 4 8 4zm0 6c-1.1 0-2-0.9-2-2s0.9-2 2-2 2 0.9 2 2-0.9 2-2 2z"/>
      </svg>
    ),
    edit: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M12.3 3.7l-11 11-2.3-2.3 11-11 2.3 2.3zm-1.4-1.4L9.1 0.5l2.3 2.3-1.8 1.8z"/>
      </svg>
    ),
    delete: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M2 4h12v2H2V4zm2-2h8v2H4V2zm2 4h1v6H6v-6zm3 0h1v6H9v-6zm3 0h1v6h-1v-6z"/>
      </svg>
    ),
    close: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M12.8 3.2L8 8l4.8 4.8-1.6 1.6L6.4 8 11.2 3.2 12.8 3.2z"/>
      </svg>
    ),
    location: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M8 0C5.2 0 3 2.2 3 5c0 3.4 5 9 5 9s5-5.6 5-9c0-2.8-2.2-5-5-5z"/>
      </svg>
    ),
    lock: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M3 7h10v8H3V7zm2-4h6v2H5V3z"/>
        <circle cx="8" cy="11" r="1.5"/>
      </svg>
    ),
    key: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/>
        <circle cx="8" cy="8" r="1"/>
      </svg>
    ),
    dashboard: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M2 1h12v3H2V1zm0 5h8v7H2V6zm10 0h2v7h-2V6z"/>
      </svg>
    ),
    search: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M15.5 14.3l-3.7-3.7c0.7-1 1.1-2.2 1.1-3.5C12.9 3.2 9.8 0 6 0S-0.9 3.2 0.1 7s3.2 6.9 7.1 6.9c1.3 0 2.5-0.4 3.5-1.1l3.7 3.7c0.2 0.2 0.5 0.2 0.7 0 0.1-0.1 0.1-0.2 0-0.3z"/>
      </svg>
    ),
    time: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="7"/>
        <path d="M8 3v5h4"/>
      </svg>
    ),
    note: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M2 1h12v14H2V1zm2 2h8v2H4V3zm0 4h8v2H4V7zm0 4h5v2H4v-2z"/>
      </svg>
    ),
    star: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M8 1l2.2 4.8h5.1L10.8 9.2l1.7 5.1L8 11.8l-4.5 2.5L5.2 9.2 0.7 5.8h5.1z"/>
      </svg>
    ),
    hospital: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M2 1h12v14H2V1zm2 2h8v2H4V3zm0 4h2v2H4V7zm4 0h2v2H8V7zm4 0h2v2h-2V7zm-8 4h2v2H4v-2zm4 0h2v2H8v-2zm4 0h2v2h-2v-2z"/>
      </svg>
    ),
    success: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 5.5L6.5 12l-2-2 1.4-1.4 0.6 0.6 3.6-3.6 1.4 1.4z"/>
      </svg>
    ),
    pending: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6"/>
        <path d="M8 3v5h5"/>
      </svg>
    ),
    error: (
      <svg width={size} height={size} fill={color} viewBox="0 0 16 16">
        <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 5.5L8 12l-3.5-6.5L6 4l2 3.5L10 4l1.5 1.5z"/>
      </svg>
    )
  };

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {icons[name] || icons.person}
    </span>
  );
};