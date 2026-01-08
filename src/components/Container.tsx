import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string; // optional extra classes
}

export const Container: React.FC<ContainerProps> = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen w-full px-4 py-6 ${className}`}>
      <div className="max-w-4xl mx-auto">{children}</div>
    </div>
  );
};
