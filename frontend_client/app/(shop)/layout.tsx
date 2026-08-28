import React from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      <Header />
      <main className="flex-1 w-full max-w-[1300px] mx-auto px-4 sm:px-8 lg:px-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}