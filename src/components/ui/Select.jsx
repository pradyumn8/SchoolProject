import React, { forwardRef } from 'react';

const Select = forwardRef(
  (
    {
      options = [],
      label,
      error,
      className = '',
      fullWidth = false,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const handleChange = (e) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    const selectClass = `
      block rounded-md shadow-sm sm:text-sm
      border px-3 py-2 bg-white text-gray-900
      ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim();

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={selectClass}
          onChange={handleChange}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
