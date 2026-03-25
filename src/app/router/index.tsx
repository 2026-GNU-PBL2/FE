import { createBrowserRouter } from "react-router-dom";
import RouterRoot from "./RouterRoot";
import HomePage from "@/pages/home/HomePage";
import NotFoundPage from "@/pages/not-found/NotFoundPage";
import MainLayout from "@/layouts/MainLayout";
import PartyListPage from "@/pages/party/PartyListPage";
import PartyCreatePage from "@/pages/party/PartyCreatePage";
import LoginPage from "@/pages/auth/LoginPage";
import SocialLoginCallbackPage from "@/pages/auth/SocialLoginCallbackPage";
import MyPage from "@/pages/my/MyPage";
import SetupIntroPage from "@/pages/setup/SetupIntroPage";
import SetupProfilePage from "@/pages/setup/SetupProfilePage";
import SetupSecurityPage from "@/pages/setup/SetupSecurityPage";
import SetupPhonePage from "@/pages/setup/SetupPhonePage";
import SetupCompletePage from "@/pages/setup/SetupCompletePage";
import AboutPage from "@/pages/about/AboutPage";
import EventPage from "@/pages/event/EventPage";
import SupportPage from "@/pages/support/SupportPage";

const router = createBrowserRouter([
  {
    element: <RouterRoot />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/about", element: <AboutPage /> },
          { path: "/event", element: <EventPage /> },
          { path: "/support", element: <SupportPage /> },
          { path: "/mypage", element: <MyPage /> },
          { path: "/parties", element: <PartyListPage /> },
          { path: "/party/create/:ottSlug", element: <PartyCreatePage /> },
          {
            path: "/parties/:type",
            element: <PartyListPage />,
          },
        ],
      },
      {
        path: "/log-in",
        element: <LoginPage />,
      },
      {
        path: "/log-in/callback",
        element: <SocialLoginCallbackPage />,
      },
      {
        path: "/setup/intro",
        element: <SetupIntroPage />,
      },
      {
        path: "/setup/profile",
        element: <SetupProfilePage />,
      },
      {
        path: "/setup/security",
        element: <SetupSecurityPage />,
      },
      {
        path: "/setup/phone",
        element: <SetupPhonePage />,
      },
      {
        path: "/setup/complete",
        element: <SetupCompletePage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
