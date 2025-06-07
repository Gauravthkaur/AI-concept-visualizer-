
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-150 ease-in-out flex items-center justify-center shadow-md hover:shadow-lg";
  
  let variantStyle = '';
  switch (variant) {
    case 'primary':
      variantStyle = 'bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700 focus:ring-sky-400 disabled:bg-sky-700 disabled:text-sky-400 disabled:cursor-not-allowed disabled:shadow-none';
      break;
    case 'secondary':
      variantStyle = 'bg-slate-600 text-slate-100 hover:bg-slate-500 active:bg-slate-700 focus:ring-slate-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none';
      break;
    case 'danger':
      variantStyle = 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 disabled:bg-red-800 disabled:text-red-400 disabled:cursor-not-allowed disabled:shadow-none';
      break;
  }

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
