import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { useAuthStore } from "@/stores/authStore";

export default function MainLayout() {
  const location = useLocation();
  const { accessToken, authStatus, isAuthenticated } = useAuthStore();
  const isLoggedIn =
    Boolean(accessToken) && isAuthenticated && authStatus === "authenticated";
  const isLandingPage = location.pathname === "/" && !isLoggedIn;

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg">
      {!isLandingPage && <Navbar />}
      <main
        className={[
          "flex-1 overflow-y-auto",
          isLandingPage ? "bg-[#f5f5f7] pb-0" : "bg-brand-bg pb-20 md:pb-0",
        ].join(" ")}
      >
        <Outlet />
      </main>
      {!isLandingPage && <Footer />}
      {!isLandingPage && <MobileBottomNav />}
    </div>
  );
}
