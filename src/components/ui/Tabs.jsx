import React from 'react';

const Tabs = ({ children, className = '', ...props }) => {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
};

const TabList = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`flex space-x-1 border-b border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const Tab = ({ children, isActive = false, className = '', ...props }) => {
  const baseStyle = 'px-4 py-2 text-sm font-medium transition-colors';
  const activeStyle = isActive
    ? 'border-b-2 border-primary-600 text-primary-600'
    : 'text-gray-500 hover:text-gray-700';

  return (
    <button
      className={`${baseStyle} ${activeStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const TabPanel = ({ children, className = '', ...props }) => {
  return (
    <div className={`mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export { Tabs, TabList, Tab, TabPanel };
