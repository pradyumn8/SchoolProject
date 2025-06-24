import React, { forwardRef } from 'react';

const Textarea = forwardRef(({
  label,
  error,
  className = '',
  fullWidth = false,
  id,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const baseClass = 'block rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm';
  const extraClass = 'border px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 resize-y min-h-[80px]';
  const errorClass = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        className={`${baseClass} ${extraClass} ${errorClass} ${widthClass} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
