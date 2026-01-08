import { IconPrompt } from "@tabler/icons-react";
import { TransitionLink } from "./TransitionLink";
import ThemeToggleButton from "./ThemeToggleButton";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-100/30 dark:border-white/10 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-white">
        {/* Logo */}
        <TransitionLink to="/">
          <div className="flex items-center gap-3 backdrop-blur-2xl">
            <div className="flex items-center gap-2">
              <p className="bg-linear-to-br from-slate-300 to-slate-500 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent">
                Astra
              </p>
              <IconPrompt className="size-9 text-emerald-300" />
            </div>

            {/* Beta badge */}
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[12px] font-semibold tracking-wider text-emerald-400 uppercase ring-1 ring-emerald-400/30">
              Beta
            </span>
          </div>
        </TransitionLink>

        {/* Nav links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <TransitionLink
            className="text-neutral-600 transition duration-300 ease-in-out hover:text-black dark:hover:text-white"
            to="/"
          >
            Home
          </TransitionLink>
          <TransitionLink
            className="text-neutral-600 transition duration-300 ease-in-out hover:text-black dark:hover:text-white"
            to="/chat"
          >
            Chat
          </TransitionLink>
          <TransitionLink
            className="text-neutral-600 transition duration-300 ease-in-out hover:text-black dark:hover:text-white"
            to="/scraper"
          >
            Scraper
          </TransitionLink>

          <TransitionLink
            className="text-neutral-600 transition duration-300 ease-in-out hover:text-black dark:hover:text-white"
            to="/contact"
          >
            Contact
          </TransitionLink>

          {/* Auth links */}
          <div className="ml-4 flex items-center gap-4">
            <TransitionLink
              to="/login"
              className="rounded-md border border-neutral-100/20 bg-black px-4 py-2 text-white hover:text-white/80  transition dark:hover:bg-neutral-900"
            >
              Login
            </TransitionLink>

            <TransitionLink
              to="/signup"
              className="rounded-md bg-white px-4 py-2 text-black transition hover:bg-neutral-200 border"
            >
              Sign Up
            </TransitionLink>

            {/* Dark Mode Button */}
            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
