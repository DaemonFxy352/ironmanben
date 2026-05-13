import { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Card({ children, className = "", style }: CardProps) {
  return (
    <div className={`bg-card rounded-xl p-4 shadow-card ${className}`} style={style}>
      {children}
    </div>
  );
}
