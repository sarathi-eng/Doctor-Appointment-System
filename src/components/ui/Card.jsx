import React from 'react';

const Card = ({ children, style = {}, padding = 'medium', shadow = 'medium', ...props }) => {
  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)'
    };

    const paddingStyle = {
      none: { padding: '0px' },
      small: { padding: '16px' },
      medium: { padding: '24px' },
      large: { padding: '32px' }
    };

    const shadowStyle = {
      none: { boxShadow: 'none' },
      small: { boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' },
      medium: { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
      large: { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
      xlarge: { boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }
    };

    return {
      ...baseStyle,
      ...paddingStyle[padding],
      ...shadowStyle[shadow],
      ...style
    };
  };

  const cardStyle = getCardStyle();

  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 25px -5px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = cardStyle.boxShadow;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;