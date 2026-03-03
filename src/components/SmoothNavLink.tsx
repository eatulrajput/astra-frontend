import { NavLink, useNavigate } from "react-router-dom";
import type { MouseEvent } from "react";

type SmoothNavLinkProps = {
  to: string;
  children: React.ReactNode;
  className?: string | ((props: { isActive: boolean }) => string) | undefined;
  onClick?: () => void;
};

export function SmoothNavLink({ to, children, className }: SmoothNavLinkProps) {
  const navigate = useNavigate();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (!document.startViewTransition) {
      navigate(to);
      return;
    }

    document.startViewTransition(() => {
      navigate(to);
    });
  };

  return (
    <NavLink to={to} className={className} onClick={handleClick}>
      {children}
    </NavLink>
  );
}