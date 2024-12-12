interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-24 w-24'
  };

  return (
    <div className="flex justify-center p-4">
      <div 
        className={`
          animate-spin 
          rounded-full 
          border-b-2 
          border-purple-900 
          dark:border-purple-700
          ${sizeClasses[size]}
          ${className}
        `}
      />
    </div>
  );
}; 