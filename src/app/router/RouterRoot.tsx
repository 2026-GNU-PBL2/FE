import { Outlet } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";

export default function RouterRoot() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}
