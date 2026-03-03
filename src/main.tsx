import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
// import {
//   Route,
//   RouterProvider,
//   createBrowserRouter,
//   createRoutesFromElements,
// } from "react-router-dom";
// import Layout from "@/components/Layout.tsx";
// import { Home, Chat, Contact, Login, NotFound, Signup, Scraper } from "@/pages";

// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route path="/" element={<Layout />}>
//       <Route path="" element={<Home />} />
//       <Route path="/chat" element={<Chat />} />
//       <Route path="/contact" element={<Contact />} />
//       <Route path="/Login" element={<Login />} />
//       <Route path="/notfound" element={<NotFound />} />
//       <Route path="/signup" element={<Signup />} />
//       <Route path="/scraper" element={<Scraper />} />
      
//     </Route>,
//   ),
// );

createRoot(document.getElementById("root")!).render(
//   <RouterProvider router={router} />,
<App/>
);
