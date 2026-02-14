// src/app/providers.tsx

import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/services/queryClient";
import ScrollToTop from "@/shared/components/ScrollToTop";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );
}
