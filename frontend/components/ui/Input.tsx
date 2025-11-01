'use client'
import React, { useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  startIcon?: React.ReactNode; // Add startIcon prop
}

const Input: React.FC<InputProps> = ({
  className = '',
  type = 'text',
  startIcon,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const isPasswordType = type === 'password';

  return (
    <div className="relative">
      <input
        type={isPasswordType && !showPassword ? 'password' : 'text'}
        className={`w-full px-4 py-3 rounded-xl bg-[#222831] text-[#D8D7CE] focus:outline-none focus:ring-4 focus:ring-[#00A6C0] focus:border-transparent transition duration-300 ${startIcon ? 'pr-12' : ''} ${className}`}
        {...props}
      />
      {startIcon && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00A6C0]">
          {startIcon}
        </span>
      )}
      {isPasswordType && (
        <span
          className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#00A6C0]"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
        </span>
      )}
    </div>
  );
};

export default Input;
