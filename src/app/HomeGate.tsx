// src/app/HomeGate.tsx
import { useAuthStore } from "@/stores/useAuthStore";
import App from "./App";
import LandingPage from "@/features/landing/LandingPage";

const DEV_FORCE_LOGIN = true; // 🔥 개발용 스위치

export default function HomeGate() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  if (!isLoggedIn && !DEV_FORCE_LOGIN) {
    return <LandingPage />;
  }

  return <App />;
}
