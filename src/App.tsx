import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Home } from "./pages/Home";
import { Contact } from "./pages/Contact";
import { Chat } from "./pages/Chat";
import { Login } from "./auth/Login";
import { Signup } from "./auth/Signup";
import { Scraper } from "./pages/Scraper";
// import { useEffect } from "react";
import Lenis from "lenis";
import { NotFound } from "./pages/NotFound";

function App() {


// Using Lenis for smooth slow scrolling
const lenis = new Lenis({
  duration: 1.4,       // higher = slower scroll
  smoothWheel: true,   // smooth mouse wheel
  lerp: 0.1,           // lower = smoother / slower
});

function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

  return (
    <div className="min-h-screen text-white max-w-500 mx-auto min-w-sm">
      <BrowserRouter>
        <div className="flex justify-end px-4">
        </div>
        <Navbar />
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast: `
        bg-neutral-900 border border-white/10 text-white
        data-[type=success]:bg-emerald-500/10
        data-[type=success]:text-emerald-400
        data-[type=success]:border-emerald-400/20

        data-[type=error]:bg-red-500/10
        data-[type=error]:text-red-400
        data-[type=error]:border-red-400/20

        data-[type=warning]:bg-amber-500/10
        data-[type=warning]:text-amber-400
        data-[type=warning]:border-amber-400/20

        data-[type=info]:bg-blue-500/10
        data-[type=info]:text-blue-400
        data-[type=info]:border-blue-400/20
      `,
            },
          }}
        />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/scraper" element={<Scraper />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/404" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
