import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    { label, error, className = '', fullWidth = false, id, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const inputClass = `
      block rounded-md shadow-sm sm:text-sm
      border px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400
      ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim();

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={inputClass}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
