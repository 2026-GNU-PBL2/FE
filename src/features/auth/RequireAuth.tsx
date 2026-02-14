// src/features/auth/RequireAuth.tsx
import { useAuthStore } from "@/stores/useAuthStore";
import { Navigate } from "react-router-dom";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
