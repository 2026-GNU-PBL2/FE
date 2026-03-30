import { createBrowserRouter, Navigate } from "react-router-dom";
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
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import SetupRoute from "./SetupRoute";
import NotificationPage from "@/pages/notification/NotificationPage";
import ProfileManagePage from "@/pages/my/ProfileManagePage";
import PasswordManagePage from "@/pages/my/PasswordManagePage";
import PaymentMethodManagePage from "@/pages/my/PaymentMethodManagePage";
import MoneyManagePage from "@/pages/my/MoneyManagePage";
import PaymentHistoryPage from "@/pages/my/PaymentHistoryPage";
import PartyHistoryPage from "@/pages/my/PartyHistoryPage";
import SettingsPage from "@/pages/my/SettingsPage";
import Myparty from "@/pages/party/MyParty";

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
          { path: "/parties", element: <PartyListPage /> },
          { path: "/parties/:type", element: <PartyListPage /> },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { path: "/notification", element: <NotificationPage /> },
              {
                path: "/mypage",
                element: <MyPage />,
                children: [
                  { index: true, element: <Navigate to="profile" replace /> },
                  { path: "profile", element: <ProfileManagePage /> },
                  { path: "password", element: <PasswordManagePage /> },
                  {
                    path: "payment-method",
                    element: <PaymentMethodManagePage />,
                  },
                  { path: "money", element: <MoneyManagePage /> },
                  {
                    path: "payment-history",
                    element: <PaymentHistoryPage />,
                  },
                  { path: "party-history", element: <PartyHistoryPage /> },
                  { path: "settings", element: <SettingsPage /> },
                ],
              },
              { path: "/myparty", element: <Myparty /> },
              { path: "/party/create/:ottSlug", element: <PartyCreatePage /> },
            ],
          },
        ],
      },

      {
        element: <PublicRoute />,
        children: [
          {
            path: "/log-in",
            element: <LoginPage />,
          },
        ],
      },

      {
        path: "/oauth/:provider/callback",
        element: <SocialLoginCallbackPage />,
      },

      {
        element: <SetupRoute />,
        children: [
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
        ],
      },

      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
