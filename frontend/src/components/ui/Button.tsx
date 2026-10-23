import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs font-medium',
    md: 'px-4 py-2 text-sm font-medium',
    lg: 'px-5 py-2.5 text-base font-medium',
  };

  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:bg-indigo-300',
    secondary: 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm disabled:bg-slate-400',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm disabled:bg-slate-50 disabled:text-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:bg-rose-300',
    ghost: 'hover:bg-slate-100 text-slate-700 disabled:text-slate-400',
    link: 'text-indigo-600 hover:underline p-0 h-auto font-medium',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-1 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
