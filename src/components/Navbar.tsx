import { IconPrompt, IconMenu2, IconX } from "@tabler/icons-react";
import { TransitionLink } from "./TransitionLink";
import ThemeToggleButton from "./ThemeToggleButton";
import { useState} from "react";
import { AnimatePresence, motion } from "motion/react";

export default function Navbar() {
  const [open, setOpen] = useState(false);


  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-100/30 backdrop-blur-md dark:border-white/10">
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

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="ease-incursor-pointer text-neutral-700 duration-700 md:hidden dark:text-neutral-200"
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="popLayout">
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute, inset-0"
              >
                <IconX size={28} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute, inset-1"
              >
                <IconMenu2 size={28} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Nav links - desktop view */}
        <div className="hidden items-center gap-6 text-sm font-medium md:flex">
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
              className="rounded-md border border-neutral-100/20 bg-black px-4 py-2 text-white transition hover:text-white/80 dark:hover:bg-neutral-900"
            >
              Login
            </TransitionLink>

            <TransitionLink
              to="/signup"
              className="rounded-md border bg-white px-4 py-2 text-black transition hover:bg-neutral-200"
            >
              Sign Up
            </TransitionLink>

            {/* Dark Mode Button */}
            <ThemeToggleButton />
          </div>
        </div>
      </div>


      {/* Nav links - mobile view */}


      <div
        className={`overflow-hidden transition duration-700 ease-in md:hidden ${open ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="flex flex-col gap-6 px-6 pt-4 pb-6 text-sm font-medium">
          <TransitionLink onClick={() => setOpen(false)} to="/">
            Home
          </TransitionLink>
          <TransitionLink onClick={() => setOpen(false)} to="/chat">
            Chat
          </TransitionLink>
          <TransitionLink onClick={() => setOpen(false)} to="/scraper">
            Scraper
          </TransitionLink>
          <TransitionLink onClick={() => setOpen(false)} to="/contact">
            Contact
          </TransitionLink>

          <div className="flex gap-4 pt-4">
            <TransitionLink
              onClick={() => setOpen(false)}
              className="rounded-md border border-neutral-100/20 bg-black px-4 py-2 text-white transition hover:text-white/80 dark:hover:bg-neutral-900"
              to="/login"
            >
              Login
            </TransitionLink>

            <TransitionLink
              onClick={() => setOpen(false)}
              className="rounded-md border bg-white px-4 py-2 text-black transition hover:bg-neutral-200"
              to="/sign up"
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
