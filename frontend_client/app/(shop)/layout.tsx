import React from "react";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-page text-primary transition-colors duration-200">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}