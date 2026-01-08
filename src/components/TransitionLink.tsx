import { type ReactNode, type  MouseEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";

type TransitionLinkProps = {
  to: string;
  children: ReactNode;
  className?:
    | string
    | ((props: { isActive: boolean }) => string);
};

export const TransitionLink = ({
  to,
  children,
  className,
}: TransitionLinkProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = location.pathname === to;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Fallback for browsers without View Transitions
    if (!document.startViewTransition) {
      navigate(to);
      return;
    }

    document.startViewTransition(() => {
      navigate(to);
    });
  };

  const resolvedClassName =
    typeof className === "function"
      ? className({ isActive })
      : className;

  return (
    <a href={to} onClick={handleClick} className={resolvedClassName}>
      {children}
    </a>
  );
}
