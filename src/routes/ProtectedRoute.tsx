import { RedirectToSignIn, Show } from "@clerk/react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when={"signed-in"}>{children}</Show>

      <Show when={"signed-out"}>
        <RedirectToSignIn />
      </Show>
    </>
  );
}