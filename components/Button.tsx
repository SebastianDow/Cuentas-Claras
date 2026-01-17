import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-medium transition-all active:scale-95 duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-6 py-4 text-lg w-full"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
