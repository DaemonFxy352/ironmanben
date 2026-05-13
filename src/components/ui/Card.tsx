import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-card rounded-xl p-4 shadow-card ${className}`}>
      {children}
    </div>
  );
}
