import { Toaster } from "sonner";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Layout from "@/components/Layout.tsx";
import { Home, Chat, Dashboard, NotFound, Scraper } from "@/pages";
import Lenis from "lenis";
import ProtectedRoute from "./routes/ProtectedRoute";
import DomainGuard from "./auth/DomainGuard";
import { Terms } from "./agreements/Terms";
import { Privacy } from "./agreements/Privacy";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        {/* Pages */}
        <Route path="" element={<Home />} />

        {/* Protected Routes */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scraper"
          element={
            <ProtectedRoute>
              <Scraper />
            </ProtectedRoute>
          }
        />
        {/* Auth */}
        {/* <Route path="/Login" element={<Login />} /> */}
        {/* <Route path="/signup" element={<Signup />} /> */}
        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />

        {/* Agreements */}
        <Route path="/terms" element={<Terms/>}/>
        <Route path="/privacy" element={<Privacy/>}/>
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
      `,
      },
    }}
  />;

  return (
    <>
      {/* Toaster  */}
      {/* Guard domain for KIIT Students */}
      <DomainGuard>
      <RouterProvider router={router} />
      </DomainGuard>
    </>
  );
}

export default App;
