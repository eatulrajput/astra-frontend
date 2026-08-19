import { IconPrompt, IconMenu2, IconX, IconSparkles } from "@tabler/icons-react";
import { SmoothNavLink } from "./SmoothNavLink";
import ThemeToggleButton from "./ThemeToggleButton";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200/80 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 text-neutral-900 dark:text-white">
        {/* SaaS Logo */}
        <SmoothNavLink to="/">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                Astra AI
              </span>
              <IconPrompt className="size-7 text-emerald-500 dark:text-emerald-400" />
            </div>

            {/* SaaS Platform Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase ring-1 ring-emerald-500/30">
              <IconSparkles size={11} className="text-emerald-500 dark:text-emerald-400" /> SaaS Pro
            </span>
          </div>
        </SmoothNavLink>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="cursor-pointer text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="popLayout">
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <IconX size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <IconMenu2 size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Nav links - desktop view */}
        <div className="hidden items-center gap-7 text-xs font-bold md:flex">
          <SmoothNavLink
            className={({ isActive }) =>
              `transition-colors duration-200 hover:text-emerald-600 dark:hover:text-emerald-400 ${
                isActive ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-neutral-600 dark:text-neutral-300"
              }`
            }
            to="/"
          >
            Home
          </SmoothNavLink>

          <Show when={"signed-in"}>
            <SmoothNavLink
              className={({ isActive }) =>
                `transition-colors duration-200 hover:text-emerald-600 dark:hover:text-emerald-400 ${
                  isActive ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-neutral-600 dark:text-neutral-300"
                }`
              }
              to="/chat"
            >
              RAG Workspace
            </SmoothNavLink>

            <SmoothNavLink
              className={({ isActive }) =>
                `transition-colors duration-200 hover:text-emerald-600 dark:hover:text-emerald-400 ${
                  isActive ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-neutral-600 dark:text-neutral-300"
                }`
              }
              to="/dashboard"
            >
              Analytics
            </SmoothNavLink>

            <SmoothNavLink
              className={({ isActive }) =>
                `transition-colors duration-200 hover:text-emerald-600 dark:hover:text-emerald-400 ${
                  isActive ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-neutral-600 dark:text-neutral-300"
                }`
              }
              to="/scraper"
            >
              Web Extractor
            </SmoothNavLink>
          </Show>

          {/* Auth CTA Actions */}
          <div className="ml-4 flex items-center gap-3">
            <Show when={"signed-out"}>
              <SignInButton mode="modal">
                <button className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition-all">
                  Get Started
                </button>
              </SignUpButton>
            </Show>

            <Show when={"signed-in"}>
              <UserButton />
            </Show>

            <ThemeToggleButton />
          </div>
        </div>
      </div>

      {/* Nav links - mobile view */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 pt-4 pb-6 text-xs font-bold">
              <SmoothNavLink onClick={() => setOpen(false)} to="/">
                Home
              </SmoothNavLink>

              <Show when={"signed-in"}>
                <SmoothNavLink onClick={() => setOpen(false)} to="/chat">
                  RAG Workspace
                </SmoothNavLink>
                <SmoothNavLink onClick={() => setOpen(false)} to="/dashboard">
                  Analytics
                </SmoothNavLink>
                <SmoothNavLink onClick={() => setOpen(false)} to="/scraper">
                  Web Extractor
                </SmoothNavLink>
              </Show>

              <div className="flex items-center gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <Show when={"signed-out"}>
                  <SignInButton mode="modal">
                    <button onClick={() => setOpen(false)} className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 px-4 py-2 text-neutral-800 dark:text-neutral-200">
                      Sign In
                    </button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <button onClick={() => setOpen(false)} className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-white font-bold">
                      Get Started
                    </button>
                  </SignUpButton>
                </Show>

                <Show when={"signed-in"}>
                  <UserButton />
                </Show>

                <ThemeToggleButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
