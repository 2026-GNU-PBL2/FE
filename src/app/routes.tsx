// src/app/routes.tsx
import { Route, Routes } from "react-router-dom";
import HomeGate from "./HomeGate";
import Loginpage from "@/features/login/LoginPage";
import IntroPage from "@/features/setup/IntroPage";
import PreferencePage from "@/features/setup/PreferencePage";
import ConnectPage from "@/features/setup/ConnectPage";
import CompletePage from "@/features/setup/CompletePage";
import MyPage from "@/features/mypage/MyPage";
import NotificationsPage from "@/features/notifications/NotificationsPage";
import ProfilePage from "@/features/mypage/profile/ProfilePage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeGate />} />
      <Route path="/log-in" element={<Loginpage />} />
      <Route path="/setup/intro" element={<IntroPage />} />
      <Route path="/setup/preference" element={<PreferencePage />} />
      <Route path="/setup/connect" element={<ConnectPage />} />
      <Route path="/setup/complete" element={<CompletePage />} />

      {/* 서브 페이지 */}
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/mypage/profile" element={<ProfilePage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
    </Routes>
  );
}
