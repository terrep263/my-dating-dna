import React, { ReactNode } from 'react';

interface DNAContainerProps {
  children: ReactNode;
  className?: string;
}

interface DNANavProps {
  children: ReactNode;
  className?: string;
}

interface DNALogoProps {
  className?: string;
}

// Dating DNA styled components for consistent branding
export const DNAContainer: React.FC<DNAContainerProps> = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

export const DNANav: React.FC<DNANavProps> = ({ children, className = '' }) => (
  <nav className={`bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-white/10 ${className}`}>
    {children}
  </nav>
);

export const DNALogo: React.FC<DNALogoProps> = ({ className = '' }) => (
  <div className={`w-8 h-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center ${className}`}>
    <span className="text-white font-bold text-sm">DNA</span>
  </div>
);

interface DNAButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  as?: 'button' | 'a';
  [key: string]: ReactNode | string | undefined;
}

export const DNAButton: React.FC<DNAButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  className = '', 
  as = 'button',
  ...props 
}) => {
  const baseClasses = 'font-semibold transition-all duration-300 rounded-full';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
  };
  
  const sizes = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  if (as === 'a') {
    return (
      <a className={classes} {...props}>
        {children}
      </a>
    );
  }
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};