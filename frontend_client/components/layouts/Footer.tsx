import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-card border-t border-line text-primary transition-colors duration-200">
      {/* Container chính rộng thoáng */}
      <div className="max-w-[1550px] mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
          {/* ================= CỘT 1: THÔNG TIN THƯƠNG HIỆU (Chiếm 6/12 cột) ================= */}
          <div className="md:col-span-6 space-y-4">
            {/* Logo */}
            <Link href="/" className="inline-block">
              <span className="text-2xl sm:text-3xl font-black tracking-[0.25em] text-primary uppercase font-mono">
                THE LUKI
              </span>
            </Link>

            {/* Địa chỉ & Liên hệ */}
            <div className="space-y-2 text-xs sm:text-sm text-secondary tracking-wide">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                <span>
                  64 Tân Canh, Phường Tân Sơn Hòa, Thành Phố Hồ Chí Minh
                </span>
              </p>

              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted shrink-0" />
                <span>
                  <strong className="text-primary font-semibold">Email:</strong>{" "}
                  <a
                    href="mailto:cskh@theluki.vn"
                    className="hover:text-primary hover:underline transition-colors"
                  >
                    cskh@theluki.vn
                  </a>
                </span>
              </p>

              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted shrink-0" />
                <span>
                  <strong className="text-primary font-semibold">
                    Chăm sóc khách hàng:
                  </strong>{" "}
                  <a
                    href="tel:0775665912"
                    className="hover:text-primary hover:underline font-mono"
                  >
                    0775 665 912
                  </a>
                </span>
              </p>

              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted shrink-0" />
                <span>
                  <strong className="text-primary font-semibold">
                    Tư vấn bán hàng:
                  </strong>{" "}
                  <a
                    href="tel:0902600912"
                    className="hover:text-primary hover:underline font-mono"
                  >
                    0902 600 912
                  </a>
                </span>
              </p>
            </div>

            {/* Mạng xã hội */}
            <div className="pt-2">
              <div className="flex items-center gap-3">
                {/* Facebook Icon */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-secondary hover:text-primary hover:border-line-dark transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram Icon */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-secondary hover:text-primary hover:border-line-dark transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* TikTok Icon */}
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-secondary hover:text-primary hover:border-line-dark transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.69a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V7.95a8.3 8.3 0 0 0 4.91 1.58v-3.4a4.82 4.82 0 0 1-1-.56z" />
                  </svg>
                </a>

                {/* Shopee Icon */}
                <a
                  href="https://shopee.vn"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Shopee"
                  className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-secondary hover:text-primary hover:border-line-dark transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.34 6.91c-.48-.68-1.2-1.12-2.02-1.26-.06-.82-.36-1.57-.86-2.18A4.89 4.89 0 0 0 12.63 2a4.89 4.89 0 0 0-3.83 1.47c-.5.61-.8 1.36-.86 2.18-.82.14-1.54.58-2.02 1.26-.54.77-.76 1.74-.63 2.72l.85 6.68c.24 1.87 1.77 3.32 3.65 3.44.25.02.5.03.75.03h3.72c.25 0 .5-.01.75-.03 1.88-.12 3.41-1.57 3.65-3.44l.85-6.68c.13-.98-.09-1.95-.63-2.72zM12.63 3.6c.94 0 1.82.39 2.45 1.07.38.41.62.93.7 1.48H9.48c.08-.55.32-1.07.7-1.48.63-.68 1.51-1.07 2.45-1.07zm3.17 12.87a2.27 2.27 0 0 1-2.16 2.03H9.92a2.27 2.27 0 0 1-2.16-2.03L6.91 9.8c-.08-.65.06-1.3.41-1.8.32-.45.8-.74 1.34-.82h7.68c.54.08 1.02.37 1.34.82.35.5.49 1.15.41 1.8l-.85 6.67z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                Phương thức thanh toán được chấp nhận
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Badge MoMo */}
                <div className="h-8 px-3.5 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-none border border-pink-500 flex items-center justify-center text-xs font-black tracking-wider shadow-sm">
                  MoMo
                </div>
                {/* Badge VNPAY */}
                <div className="h-8 px-3.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-none border border-blue-500 flex items-center justify-center text-xs font-black tracking-wider shadow-sm">
                  VNPAY
                </div>
              </div>
            </div>
          </div>

          {/* ================= CỘT 2: VỀ THE LUKI (Chiếm 3/12 cột) ================= */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
              Về THE LUKI
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-secondary">
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary hover:underline transition-colors block"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="hover:text-primary hover:underline transition-colors block"
                >
                  Tuyển dụng & việc làm
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-primary hover:underline transition-colors block"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-primary hover:underline transition-colors block"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= CỘT 3: CHÍNH SÁCH KHÁCH HÀNG (Chiếm 3/12 cột) ================= */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
              Chính sách khách hàng
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-secondary">
              <li>
                <Link
                  href="/policies/sales"
                  className="hover:text-primary hover:underline transition-colors block"
                >
                  Chính sách bán hàng
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/privacy"
                  className="hover:text-primary hover:underline transition-colors block"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/membership"
                  className="hover:text-primary hover:underline transition-colors block"
                >
                  Chính sách Membership
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/international"
                  className="hover:text-primary hover:underline transition-colors block"
                >
                  Chính sách quốc tế
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/refund"
                  className="hover:text-primary hover:underline transition-colors block"
                >
                  Chính sách hoàn tiền
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/shipping"
                  className="hover:text-primary hover:underline transition-colors block"
                >
                  Chính sách vận chuyển và giao nhận
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/payment"
                  className="hover:text-primary hover:underline transition-colors block"
                >
                  Phương thức thanh toán
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar: Bản quyền */}
        <div className="mt-12 pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>© {new Date().getFullYear()} THE LUKI. Tất cả quyền được bảo lưu.</p>
          <p className="tracking-wide">
            Designed for Premium Minimalist Fashion Experience.
          </p>
        </div>
      </div>
    </footer>
  );
}
