
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-[#283B48] p-8 rounded-xl shadow-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
