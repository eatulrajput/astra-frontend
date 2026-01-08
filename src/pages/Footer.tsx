import React from "react";
import { motion } from "motion/react";
import { TransitionLink } from "../components/TransitionLink";
import { IconPrompt } from "@tabler/icons-react";

export const Footer = () => {
  return (
    <footer className="relative w-full bg-black border-t border-white/10">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-32 h-64 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          
          {/* Brand */}
          <TransitionLink to="/">
            <motion.div
              whileHover={{ opacity: 0.85 }}
              className="flex items-center gap-3"
            >
              <p className="bg-gradient-to-br from-slate-200 to-slate-400 bg-clip-text text-4xl font-semibold tracking-tight text-transparent">
                Astra
              </p>
              <IconPrompt className="size-9 text-emerald-300" />
            </motion.div>
          </TransitionLink>

          {/* Links */}
          <div className="flex flex-col gap-3 text-sm text-slate-400">
            <p className="font-medium text-slate-200">Product</p>
            <TransitionLink to="/features" className="hover:text-emerald-300 transition">
              Features
            </TransitionLink>
            <TransitionLink to="/pricing" className="hover:text-emerald-300 transition">
              Pricing
            </TransitionLink>
            <TransitionLink to="/docs" className="hover:text-emerald-300 transition">
              Docs
            </TransitionLink>
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-3 text-sm text-slate-400">
            <p className="font-medium text-slate-200">Company</p>
            <TransitionLink to="/about" className="hover:text-emerald-300 transition">
              About
            </TransitionLink>
            <TransitionLink to="/privacy" className="hover:text-emerald-300 transition">
              Privacy
            </TransitionLink>
            <TransitionLink to="/terms" className="hover:text-emerald-300 transition">
              Terms
            </TransitionLink>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} Astra. All rights reserved.</p>
          <p className="text-slate-600">
            Crafted with precision ✦ Powered by React
          </p>
        </div>
      </div>
    </footer>
  );
};
