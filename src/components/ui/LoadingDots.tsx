interface LoadingDotsProps {
  color?: string;
}

export const LoadingDots = ({ color = "purple" }: LoadingDotsProps) => (
  <div className="animate-pulse flex gap-1">
    <div 
      className={`w-1 h-1 rounded-full bg-${color}-500 animate-bounce [animation-delay:-0.3s]`}
    ></div>
    <div 
      className={`w-1 h-1 rounded-full bg-${color}-500 animate-bounce [animation-delay:-0.15s]`}
    ></div>
    <div 
      className={`w-1 h-1 rounded-full bg-${color}-500 animate-bounce`}
    ></div>
  </div>
); 