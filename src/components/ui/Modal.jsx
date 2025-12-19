import React from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'medium', style = {} }) => {
  if (!isOpen) return null;

  const getModalSize = () => {
    const sizeMap = {
      small: { maxWidth: '448px' },
      medium: { maxWidth: '512px' },
      large: { maxWidth: '768px' },
      xlarge: { maxWidth: '1024px' }
    };
    return sizeMap[size] || sizeMap.medium;
  };

  const modalSizeStyle = getModalSize();

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '50',
      overflowY: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div 
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(107, 114, 128, 0.75)',
          transition: 'opacity 0.2s ease',
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      ></div>

      <div style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        backgroundColor: 'white',
        borderRadius: '16px',
        textAlign: 'left',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        transform: 'translateY(0)',
        transition: 'all 0.3s ease',
        width: '100%',
        maxWidth: modalSizeStyle.maxWidth,
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {title && (
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
            padding: '24px',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#111827',
                margin: '0'
              }}>
                {title}
              </h3>
              <button
                onClick={onClose}
                style={{
                  color: '#9ca3af',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#6b7280';
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#9ca3af';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <svg style={{ height: '24px', width: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          ...style
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;