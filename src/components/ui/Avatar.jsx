import React from 'react';

const Avatar = ({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const initials = fallback || alt
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const containerClass = [
    'relative flex shrink-0 overflow-hidden rounded-full bg-gray-200',
    sizeClasses[size],
    className
  ].join(' ');

  return (
    <div className={containerClass} {...props}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary-100 text-primary-800 font-medium">
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar;
