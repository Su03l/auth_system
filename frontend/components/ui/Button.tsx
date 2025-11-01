
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  startIcon?: React.ReactNode; // Add startIcon prop
  endIcon?: React.ReactNode; // Add endIcon prop
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  startIcon,
  endIcon,
  ...props
}) => {
  return (
    <button
      className={`px-6 py-3 rounded-md font-semibold transition duration-300 flex items-center justify-center ${className}`}
      {...props}
    >
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2">{endIcon}</span>}
    </button>
  );
};

export default Button;
