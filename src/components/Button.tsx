import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  loading = false,
  size = 'md',
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variants = {
    primary:
      'bg-questrade-green text-white hover:bg-questrade-green-dark focus-visible:ring-questrade-green disabled:bg-questrade-grey-300 disabled:text-questrade-grey-500 disabled:cursor-not-allowed',
    secondary:
      'bg-white text-questrade-grey-800 border border-questrade-grey-300 hover:bg-questrade-grey-50 focus-visible:ring-questrade-grey-400',
  };

  const sizes = {
    sm: 'px-5 py-1.5 text-[15px] min-h-[36px]',
    md: 'px-6 py-2.5 text-[16px] min-h-[44px]',
  };

  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-1.5 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
