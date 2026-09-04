import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";
import TheLukiLoader from "../components/common/TheLukiLoader";

const LayoutAdmin: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Sidebar bên trái */}
      <Sidebar />

      {/* Vùng nội dung chính */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#f2f1ee] text-zinc-900">
        {/* Header trên cùng */}
        <Header />

        {/* Nội dung trang */}
        <main className="flex-1 overflow-y-auto p-4 text-zinc-900">
          <Suspense fallback={<TheLukiLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default LayoutAdmin;