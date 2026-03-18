import { Toaster } from "sonner";
import { useEffect } from "react";
import {
  useLocation,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Layout from "@/components/Layout.tsx";
import { Home, Chat, Contact, Dashboard, Login, NotFound, Signup, Scraper } from "@/pages";
import Lenis from "lenis";

export function ScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 0);
      }
    }
  }, [hash]);

  return null;
}



function App() {
  <ScrollToHash/>
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route path="" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/scraper" element={<Scraper />} />
      </Route>,
    ),
  );

  // Using Lenis for smooth slow scrolling
  const lenis = new Lenis({
    duration: 1.4, // higher = slower scroll
    smoothWheel: true, // smooth mouse wheel
    lerp: 0.1, // lower = smoother / slower
  });

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

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
      `
      },
    }}
  />

  return (
    <>
      {/* Toaster  */}
      <RouterProvider router={router} />
    </>
  );
}

export default App;
