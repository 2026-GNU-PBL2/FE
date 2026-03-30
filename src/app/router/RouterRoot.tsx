import { Outlet, useLocation } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";

export default function RouterRoot() {
  const location = useLocation();

  const isMyPageDashboardRoute = location.pathname.startsWith("/mypage");

  return (
    <>
      {!isMyPageDashboardRoute && <ScrollToTop />}
      <Outlet />
    </>
  );
}
