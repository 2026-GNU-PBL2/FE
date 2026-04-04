import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/pages/admin/components/AdminSidebar";
import AdminHeader from "@/pages/admin/components/AdminHeader";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] text-slate-900">
      <div className="flex h-full">
        <AdminSidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminHeader onOpenSidebar={() => setMobileOpen(true)} />

          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
