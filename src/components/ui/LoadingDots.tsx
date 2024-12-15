interface LoadingDotsProps {
    className?: string;
}

export const LoadingDots = ({ className = '' }: LoadingDotsProps) => (
  <div className="animate-pulse flex gap-1">
    <div 
      className={`w-1 h-1 rounded-full animate-bounce [animation-delay:-0.3s] ${className}`}
    ></div>
    <div 
      className={`w-1 h-1 rounded-full animate-bounce [animation-delay:-0.15s] ${className}`}
    ></div>
    <div 
      className={`w-1 h-1 rounded-full animate-bounce ${className}`}
    ></div>
  </div>
); 