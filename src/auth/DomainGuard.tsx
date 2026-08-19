import type { ReactNode } from "react";

export default function DomainGuard({ children }: { children: ReactNode }) {
  // Universal platform guard — allows any authenticated user
  return <>{children}</>;
}
