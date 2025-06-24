import React from 'react';

const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const baseStyles =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-200 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 text-gray-700 bg-transparent',
  };

  const finalClassName = `${baseStyles} ${variantStyles[variant] || ''} ${className}`;

  return (
    <span className={finalClassName} {...props}>
      {children}
    </span>
  );
};

export default Badge;
