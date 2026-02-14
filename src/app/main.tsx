// src/app/main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/tailwind.css";
import { AppProviders } from "./providers";
import AppRoutes from "./routes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  </StrictMode>,
);
