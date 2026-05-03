import { createBrowserRouter, Navigate } from "react-router-dom";
import RouterRoot from "./RouterRoot";
import HomePage from "@/pages/home/HomePage";
import NotFoundPage from "@/pages/not-found/NotFoundPage";
import MainLayout from "@/layouts/MainLayout";
import PartyListPage from "@/pages/party/vacancy/PartyListPage";
import PartyCreatePage from "@/pages/party/common/PartyCreatePage";
import PartyRoleSelectPage from "@/pages/party/common/PartyRoleSelectPage";
import LoginPage from "@/pages/auth/LoginPage";
import SocialLoginCallbackPage from "@/pages/auth/SocialLoginCallbackPage";
import MyPage from "@/pages/my/layoout/MyPage";
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
import ProfileManagePage from "@/pages/my/account/ProfileManagePage";
import PaymentMethodManagePage from "@/pages/my/payment/PaymentMethodManagePage";
import MoneyManagePage from "@/pages/my/payment/MoneyManagePage";
import PaymentHistoryPage from "@/pages/my/payment/PaymentHistoryPage";
import PartyHistoryPage from "@/pages/my/usage/PartyHistoryPage";
import SettingsPage from "@/pages/my/account/SettingsPage";
import Myparty from "@/pages/party/my/MyParty";

import AdminRoute from "./AdminRoute";
import AdminPublicRoute from "./AdminPublicRoute";
import AdminLayout from "@/pages/admin/layout/AdminLayout";
import AdminLoginPage from "@/pages/admin/login/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/dashboard/AdminDashboardPage";
import AdminProductListPage from "@/pages/admin/product/AdminProductListPage";
import AdminProductFormPage from "@/pages/admin/product/AdminProductFormPage";
import AdminProductDetailPage from "@/pages/admin/product/AdminProductDetailPage";
import AdminUserListPage from "@/pages/admin/user/AdminUserListPage";
import AdminUserDetailPage from "@/pages/admin/user/AdminUserDetailPage";
import AdminPartyListPage from "@/pages/admin/party/AdminPartyListPage";
import AdminPartyDetailPage from "@/pages/admin/party/AdminPartyDetailPage";
import MailboxPage from "@/pages/my/usage/MailboxPage";
import PartyMemberAgreementPage from "@/pages/party/member/PartyMemberAgreementPage";
import PartyMemberAutoPayAgreementPage from "@/pages/party/member/PartyMemberAutoPayAgreementPage";
import PartyMemberCardRegisterPage from "@/pages/party/member/PartyMemberCardRegisterPage";
import PartyMemberCardRegisterSuccessPage from "@/pages/party/member/PartyMemberCardRegisterSuccessPage";
import PartyMemberCardRegisterFailPage from "@/pages/party/member/PartyMemberCardRegisterFailPage";
import PartyMemberCreatePreviewPage from "@/pages/party/member/PartyMemberCreatePreviewPage";
import PartyMemberCreateCompletePage from "@/pages/party/member/PartyMemberCreateCompletePage";
import PartyHostAgreementPage from "@/pages/party/host/PartyHostAgreementPage";
import PartyHostVerificationCallbackPage from "@/pages/party/host/PartyHostVerificationCallbackPage";
import PartyHostAccountRegisterPage from "@/pages/party/host/PartyHostAccountRegisterPage";
import PartyMemberPaymentPreviewPage from "@/pages/party/member/PartyMemberPaymentPreviewPage";
import PartyHostCreatePreviewPage from "@/pages/party/host/PartyHostCreatePreviewPage";
import PartyHostCreateCompletePage from "@/pages/party/host/PartyHostCreateCompletePage";
import MyPartyDetailPage from "@/pages/party/my/MyPartyDetailPage";
import PartyHostProvisionSetupPage from "@/pages/party/my/provision/host/PartyHostProvisionSetupPage";
import PartyHostInviteSetupPage from "@/pages/party/my/provision/host/PartyHostInviteSetupPage";
import PartyHostAdultCheckPage from "@/pages/party/my/provision/host/PartyHostAdultCheckPage";
import PartyProvisionDashboardPage from "@/pages/party/my/provision/host/PartyProvisionDashboardPage";
import PartyInviteCodeGuidePage from "@/pages/party/my/provision/host/PartyInviteCodeGuidePage";
import PartyMemberProvisionConfirmPage from "@/pages/party/my/provision/member/PartyMemberProvisionConfirmPage";
import PartyMemberProvisionDashboardPage from "@/pages/party/my/provision/member/PartyMemberProvisionDashboardPage";

const router = createBrowserRouter([
  {
    element: <RouterRoot />,
    children: [
      {
        element: <AdminPublicRoute />,
        children: [{ path: "/admin", element: <AdminLoginPage /> }],
      },
      {
        element: <AdminRoute />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              { path: "dashboard", element: <AdminDashboardPage /> },
              { path: "products", element: <AdminProductListPage /> },
              { path: "products/new", element: <AdminProductFormPage /> },
              {
                path: "products/:productId",
                element: <AdminProductDetailPage />,
              },
              {
                path: "products/:productId/edit",
                element: <AdminProductFormPage />,
              },
              { path: "users", element: <AdminUserListPage /> },
              { path: "users/:userId", element: <AdminUserDetailPage /> },
              { path: "parties", element: <AdminPartyListPage /> },
              { path: "parties/:partyId", element: <AdminPartyDetailPage /> },
            ],
          },
        ],
      },
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/about", element: <AboutPage /> },
          { path: "/event", element: <EventPage /> },
          { path: "/support", element: <SupportPage /> },
          { path: "/parties", element: <PartyListPage /> },
          { path: "/parties/:type", element: <PartyListPage /> },
          { path: "/myparty", element: <Myparty /> },
          { path: "/myparty/:partyId", element: <MyPartyDetailPage /> },
          {
            path: "/myparty/:partyId/provision/setup/:productId",
            element: <PartyHostProvisionSetupPage />,
          },
          {
            path: "/myparty/:partyId/provision/invite-setup/:productId",
            element: <PartyHostInviteSetupPage />,
          },
          {
            path: "/myparty/:partyId/provision/adult-check/:productId",
            element: <PartyHostAdultCheckPage />,
          },
          {
            path: "/myparty/:partyId/provision/dashboard",
            element: <PartyProvisionDashboardPage />,
          },
          {
            path: "/myparty/:partyId/provision/invite-guide",
            element: <PartyInviteCodeGuidePage />,
          },
          {
            path: "/myparty/:partyId/provision/confirm",
            element: <PartyMemberProvisionConfirmPage />,
          },
          {
            path: "/myparty/:partyId/provision/member-dashboard",
            element: <PartyMemberProvisionDashboardPage />,
          },

          { path: "/party/create/:productId", element: <PartyCreatePage /> },

          {
            path: "/party/create/:productId/role",
            element: <PartyRoleSelectPage />,
          },

          {
            path: "/party/create/:productId/member/agreement",
            element: <PartyMemberAgreementPage />,
          },
          {
            path: "/party/create/:productId/member/auto-pay-agreement",
            element: <PartyMemberAutoPayAgreementPage />,
          },
          {
            path: "/party/create/:productId/member/card-register",
            element: <PartyMemberCardRegisterPage />,
          },
          {
            path: "/party/create/:productId/member/card-register/success",
            element: <PartyMemberCardRegisterSuccessPage />,
          },
          {
            path: "/party/create/:productId/member/card-register/fail",
            element: <PartyMemberCardRegisterFailPage />,
          },
          {
            path: "/party/create/:productId/member/payment-preview",
            element: <PartyMemberPaymentPreviewPage />,
          },
          {
            path: "/party/create/:productId/member/create-preview",
            element: <PartyMemberCreatePreviewPage />,
          },
          {
            path: "/party/create/:productId/member/complete",
            element: <PartyMemberCreateCompletePage />,
          },

          {
            path: "/party/create/:productId/host/agreement",
            element: <PartyHostAgreementPage />,
          },
          {
            path: "/party/create/:productId/host/verification/callback",
            element: <PartyHostVerificationCallbackPage />,
          },
          {
            path: "/party/create/:productId/host/account-register",
            element: <PartyHostAccountRegisterPage />,
          },
          {
            path: "/party/create/:productId/host/create-preview",
            element: <PartyHostCreatePreviewPage />,
          },
          {
            path: "/party/create/:productId/host/complete",
            element: <PartyHostCreateCompletePage />,
          },
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
                  { path: "mailbox", element: <MailboxPage /> },
                  { path: "settings", element: <SettingsPage /> },
                ],
              },
            ],
          },
        ],
      },
      {
        element: <PublicRoute />,
        children: [{ path: "/log-in", element: <LoginPage /> }],
      },
      {
        path: "/oauth/:provider/callback",
        element: <SocialLoginCallbackPage />,
      },
      {
        element: <SetupRoute />,
        children: [
          { path: "/setup/intro", element: <SetupIntroPage /> },
          { path: "/setup/profile", element: <SetupProfilePage /> },
          { path: "/setup/security", element: <SetupSecurityPage /> },
          { path: "/setup/phone", element: <SetupPhonePage /> },
          { path: "/setup/complete", element: <SetupCompletePage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;
