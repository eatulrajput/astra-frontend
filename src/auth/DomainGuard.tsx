import { useUser, useClerk } from "@clerk/react";
import { useEffect } from "react";

export default function DomainGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const email = user.primaryEmailAddress?.emailAddress;

    if (!email?.endsWith("@kiit.ac.in")) {
      alert("Only KIIT emails are allowed");

      // Sign out user immediately
      signOut();
    }
  }, [isLoaded, user, signOut]);

  if (!isLoaded) return null;

  return <>{children}</>;
}