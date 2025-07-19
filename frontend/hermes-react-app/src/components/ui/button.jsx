import React from 'react';

export const Button = ({ children, className = '', variant = 'default', ...props }) => {
  const base = 'px-4 py-2 rounded font-semibold';
  const styles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-400 text-gray-700 bg-white hover:bg-gray-100',
  };

  return (
    <button
      className={`${base} ${styles[variant] || styles.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
