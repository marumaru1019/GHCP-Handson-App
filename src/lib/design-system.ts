// =================================
// Design System Types & Utilities
// =================================

export type ColorVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info'
  | 'ghost';

export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ComponentVariant = {
  color?: ColorVariant;
  size?: SizeVariant;
  disabled?: boolean;
  loading?: boolean;
};

// =================================
// Tailwind CSS Class Utilities
// =================================

/**
 * 🎨 Button style generator with TypeScript safety
 */
export const getButtonClasses = ({
  color = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
}: ComponentVariant = {}) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-md',
    'font-medium',
    'transition-all',
    'duration-150',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
  ];

  const colorClasses = {
    primary: [
      'bg-primary',
      'text-white',
      'hover:bg-primary-dark',
      'focus:ring-primary/20',
    ],
    secondary: [
      'bg-gray-100',
      'text-gray-900',
      'hover:bg-gray-200',
      'dark:bg-gray-800',
      'dark:text-gray-100',
      'dark:hover:bg-gray-700',
      'focus:ring-gray-400/20',
    ],
    success: [
      'bg-green-600',
      'text-white',
      'hover:bg-green-700',
      'focus:ring-green-500/20',
    ],
    warning: [
      'bg-yellow-600',
      'text-white',
      'hover:bg-yellow-700',
      'focus:ring-yellow-500/20',
    ],
    error: [
      'bg-red-600',
      'text-white',
      'hover:bg-red-700',
      'focus:ring-red-500/20',
    ],
    info: [
      'bg-blue-600',
      'text-white',
      'hover:bg-blue-700',
      'focus:ring-blue-500/20',
    ],
    ghost: [
      'bg-transparent',
      'text-gray-700',
      'hover:bg-gray-100',
      'dark:text-gray-300',
      'dark:hover:bg-gray-800',
      'focus:ring-gray-400/20',
    ],
  };

  const sizeClasses = {
    xs: ['px-2', 'py-1', 'text-xs'],
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-4', 'py-2', 'text-sm'],
    lg: ['px-6', 'py-3', 'text-base'],
    xl: ['px-8', 'py-4', 'text-lg'],
  };

  const stateClasses = [];
  if (disabled) {
    stateClasses.push('opacity-50', 'cursor-not-allowed');
  }
  if (loading) {
    stateClasses.push('animate-pulse');
  }

  return [
    ...baseClasses,
    ...colorClasses[color],
    ...sizeClasses[size],
    ...stateClasses,
  ].join(' ');
};

/**
 * 📝 Input style generator
 */
export const getInputClasses = ({
  size = 'md',
  disabled = false,
  error = false,
}: ComponentVariant & { error?: boolean } = {}) => {
  const baseClasses = [
    'w-full',
    'rounded-md',
    'border',
    'placeholder:text-gray-500',
    'focus:outline-none',
    'focus:ring-1',
    'dark:bg-gray-800',
    'dark:text-gray-100',
    'dark:placeholder:text-gray-400',
  ];

  const sizeClasses = {
    xs: ['px-2', 'py-1', 'text-xs'],
    sm: ['px-2.5', 'py-1.5', 'text-sm'],
    md: ['px-3', 'py-2', 'text-sm'],
    lg: ['px-4', 'py-3', 'text-base'],
    xl: ['px-5', 'py-4', 'text-lg'],
  };

  const stateClasses = [];
  if (error) {
    stateClasses.push(
      'border-red-300',
      'focus:border-red-500',
      'focus:ring-red-500',
      'dark:border-red-600',
    );
  } else {
    stateClasses.push(
      'border-gray-300',
      'focus:border-primary',
      'focus:ring-primary',
      'dark:border-gray-600',
      'dark:focus:border-primary-light',
    );
  }

  if (disabled) {
    stateClasses.push('opacity-50', 'cursor-not-allowed', 'bg-gray-50');
  }

  return [
    ...baseClasses,
    ...sizeClasses[size],
    ...stateClasses,
  ].join(' ');
};

/**
 * 📋 Card style generator
 */
export const getCardClasses = ({
  elevated = false,
  interactive = false,
}: {
  elevated?: boolean;
  interactive?: boolean;
} = {}) => {
  const baseClasses = [
    'rounded-lg',
    'border',
    'border-gray-200',
    'bg-white',
    'dark:border-gray-700',
    'dark:bg-gray-800',
  ];

  const stateClasses = [];
  if (elevated) {
    stateClasses.push('shadow-lg');
  } else {
    stateClasses.push('shadow-sm');
  }

  if (interactive) {
    stateClasses.push(
      'transition-all',
      'duration-150',
      'hover:shadow-md',
      'hover:scale-[1.01]',
      'cursor-pointer',
    );
  }

  return [...baseClasses, ...stateClasses].join(' ');
};

/**
 * 🏷️ Badge style generator
 */
export const getBadgeClasses = ({
  color = 'info',
  size = 'md',
}: ComponentVariant = {}) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'rounded-full',
    'font-medium',
  ];

  const colorClasses = {
    primary: [
      'bg-primary/10',
      'text-primary',
      'dark:bg-primary/20',
      'dark:text-primary-light',
    ],
    secondary: [
      'bg-gray-100',
      'text-gray-800',
      'dark:bg-gray-800',
      'dark:text-gray-200',
    ],
    success: [
      'bg-green-100',
      'text-green-800',
      'dark:bg-green-900/20',
      'dark:text-green-400',
    ],
    warning: [
      'bg-yellow-100',
      'text-yellow-800',
      'dark:bg-yellow-900/20',
      'dark:text-yellow-400',
    ],
    error: [
      'bg-red-100',
      'text-red-800',
      'dark:bg-red-900/20',
      'dark:text-red-400',
    ],
    info: [
      'bg-blue-100',
      'text-blue-800',
      'dark:bg-blue-900/20',
      'dark:text-blue-400',
    ],
    ghost: [
      'bg-transparent',
      'text-gray-600',
      'border',
      'border-gray-300',
      'dark:text-gray-400',
      'dark:border-gray-600',
    ],
  };

  const sizeClasses = {
    xs: ['px-1.5', 'py-0.5', 'text-xs'],
    sm: ['px-2', 'py-0.5', 'text-xs'],
    md: ['px-2.5', 'py-0.5', 'text-xs'],
    lg: ['px-3', 'py-1', 'text-sm'],
    xl: ['px-4', 'py-1.5', 'text-sm'],
  };

  return [
    ...baseClasses,
    ...colorClasses[color],
    ...sizeClasses[size],
  ].join(' ');
};

/**
 * 🎭 Animation utilities
 */
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
} as const;

/**
 * 📐 Layout utilities
 */
export const layouts = {
  container: 'container mx-auto px-4',
  section: 'py-12 md:py-16 lg:py-20',
  grid: {
    autoFit: 'grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6',
    autoFill: 'grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4',
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  },
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    col: 'flex flex-col',
    colCenter: 'flex flex-col items-center justify-center',
  },
} as const;

/**
 * 🎨 Color palette utilities
 */
export const colors = {
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // base
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

/**
 * 🔧 Utility function to combine classes
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * 📱 Responsive utilities
 */
export const responsive = {
  text: {
    xs: 'text-xs md:text-sm lg:text-base',
    sm: 'text-sm md:text-base lg:text-lg',
    base: 'text-base md:text-lg lg:text-xl',
    lg: 'text-lg md:text-xl lg:text-2xl',
    xl: 'text-xl md:text-2xl lg:text-3xl',
  },
  spacing: {
    xs: 'p-2 md:p-3 lg:p-4',
    sm: 'p-3 md:p-4 lg:p-6',
    base: 'p-4 md:p-6 lg:p-8',
    lg: 'p-6 md:p-8 lg:p-12',
    xl: 'p-8 md:p-12 lg:p-16',
  },
} as const;
