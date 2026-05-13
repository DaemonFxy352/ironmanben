import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  children,
  fullWidth = true,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "h-14 rounded-xl font-bold text-[17px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  const variantStyles = {
    primary: "bg-primary text-primary-text",
    secondary: "bg-card text-primary-text border border-border",
    danger: "bg-danger text-white",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
