import { useState } from "react";
import { Container } from "../components/Container";
import { Footer } from "../pages/Footer";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Login failed");
      }

      // redirect after successful login
      window.location.href = "/chat";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black/99">
      <Container className="relative min-h-full overflow-hidden bg-cover bg-center dark:bg-slate-950">
        {/* Background */}
        <div className="from emerald-300 absolute inset-0 scale-105 bg-linear-to-b to-emerald-300/10 bg-cover bg-center blur-sm dark:to-slate-950"></div>

        <div className="z-100 mx-auto flex min-h-150 w-full max-w-lg flex-col items-center justify-evenly rounded-2xl border border-neutral-100 bg-neutral-200/5 p-8 backdrop-blur-3xl dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md">
          <h2 className="mb-8 text-4xl font-medium text-black dark:text-white">
            Log In To Astra
          </h2>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-700 bg-red-900/30 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                value={username}
                placeholder="Email Address"
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-md border border-white/10 bg-white px-3 py-2 text-neutral-950 placeholder-neutral-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:bg-black/40 dark:text-white"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-white/10 bg-white px-3 py-2 text-neutral-950 placeholder-neutral-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:bg-black/40 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-emerald-400 px-4 py-2 font-medium text-black transition hover:cursor-pointer hover:bg-emerald-300 focus:ring-emerald-400 focus:outline-none disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-4 text-center text-lg text-slate-400 flex flex-wrap">
            <p>New here?&ensp;</p>
            <a
              href="/signup"
              className="text-emerald-400 hover:text-emerald-700"
            >
              Create an account.
            </a>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
};
