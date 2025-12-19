import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  loading = false,
  onClick, 
  style = {},
  type = 'button',
  ...props 
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      borderRadius: '12px',
      transition: 'all 0.2s ease',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.5 : 1,
      transform: disabled || loading ? 'none' : 'scale(1)',
      border: 'none',
      outline: 'none'
    };

    const sizeStyle = {
      small: {
        padding: '8px 16px',
        fontSize: '14px',
        minHeight: '36px'
      },
      medium: {
        padding: '12px 24px',
        fontSize: '14px',
        minHeight: '44px'
      },
      large: {
        padding: '16px 32px',
        fontSize: '16px',
        minHeight: '52px'
      }
    };

    const variantStyle = {
      primary: {
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        color: 'white',
        boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)'
      },
      secondary: {
        backgroundColor: 'white',
        color: '#374151',
        border: '1px solid #d1d5db',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      },
      success: {
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        color: 'white',
        boxShadow: '0 4px 14px 0 rgba(22, 163, 74, 0.39)'
      },
      danger: {
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        color: 'white',
        boxShadow: '0 4px 14px 0 rgba(220, 38, 38, 0.39)'
      },
      warning: {
        background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
        color: 'white',
        boxShadow: '0 4px 14px 0 rgba(234, 179, 8, 0.39)'
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#2563eb',
        border: '2px solid #2563eb',
        boxShadow: 'none'
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#374151',
        border: 'none',
        boxShadow: 'none'
      }
    };

    return {
      ...baseStyle,
      ...sizeStyle[size],
      ...variantStyle[variant],
      ...style
    };
  };

  const getHoverStyle = () => {
    if (disabled || loading) return {};

    const hoverStyle = {
      primary: {
        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
        boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.5)',
        transform: 'scale(1.02)'
      },
      secondary: {
        backgroundColor: '#f9fafb',
        borderColor: '#9ca3af',
        transform: 'scale(1.02)'
      },
      success: {
        background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
        boxShadow: '0 6px 20px 0 rgba(22, 163, 74, 0.5)',
        transform: 'scale(1.02)'
      },
      danger: {
        background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
        boxShadow: '0 6px 20px 0 rgba(220, 38, 38, 0.5)',
        transform: 'scale(1.02)'
      },
      warning: {
        background: 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)',
        boxShadow: '0 6px 20px 0 rgba(234, 179, 8, 0.5)',
        transform: 'scale(1.02)'
      },
      outline: {
        backgroundColor: '#eff6ff',
        transform: 'scale(1.02)'
      },
      ghost: {
        backgroundColor: '#f3f4f6',
        transform: 'scale(1.02)'
      }
    };

    return hoverStyle[variant];
  };

  const buttonStyle = getButtonStyle();

  return (
    <button
      type={type}
      style={buttonStyle}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.target.style, getHoverStyle());
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.target.style, buttonStyle);
        }
      }}
      {...props}
    >
      {loading && (
        <svg 
          style={{ 
            width: '16px', 
            height: '16px', 
            marginRight: '8px',
            animation: 'spin 1s linear infinite'
          }} 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4" 
            opacity="0.25"
          ></circle>
          <path 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            opacity="0.75"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;