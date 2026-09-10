import React from "react";

export default function CheckoutSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI: ĐỊA CHỈ, VẬN CHUYỂN, THANH TOÁN (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Địa chỉ nhận hàng */}
          <section className="bg-white border border-zinc-200 p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="h-5 w-40 bg-zinc-200" />
              <div className="h-4 w-16 bg-zinc-100" />
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="h-4 w-32 bg-zinc-200" />
                <div className="h-4 w-24 bg-zinc-200" />
                <div className="h-4 w-16 bg-zinc-200" />
              </div>
              <div className="h-4 w-3/4 bg-zinc-200" />
            </div>
          </section>

          {/* Section 2: Vận chuyển ViettelPost */}
          <section className="bg-white border border-zinc-200 p-5 md:p-6 space-y-4">
            <div className="pb-3 border-b border-zinc-200">
              <div className="h-5 w-56 bg-zinc-200" />
            </div>
            <div className="p-4 border border-zinc-200 bg-zinc-50 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-zinc-200 shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-zinc-200" />
                  <div className="h-3.5 w-36 bg-zinc-100" />
                  <div className="h-3.5 w-64 bg-zinc-100" />
                </div>
              </div>
              <div className="h-5 w-16 bg-zinc-200" />
            </div>
          </section>

          {/* Section 3: Phương thức thanh toán */}
          <section className="bg-white border border-zinc-200 p-5 md:p-6 space-y-4">
            <div className="pb-3 border-b border-zinc-200">
              <div className="h-5 w-48 bg-zinc-200" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-4 border border-zinc-200 bg-white flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-zinc-200 shrink-0" />
                    <div className="w-8 h-8 rounded bg-zinc-200 shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-40 bg-zinc-200" />
                      <div className="h-3 w-56 bg-zinc-100 hidden sm:block" />
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-zinc-100" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (5/12) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-zinc-200 p-5 md:p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div className="h-5 w-36 bg-zinc-200" />
              <div className="h-4 w-20 bg-zinc-100" />
            </div>

            {/* Danh sách món hàng mẫu */}
            <div className="space-y-3 pb-4 border-b border-zinc-200">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-zinc-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-44 bg-zinc-200" />
                    <div className="h-3 w-28 bg-zinc-100" />
                  </div>
                  <div className="h-4 w-16 bg-zinc-200" />
                </div>
              ))}
            </div>

            {/* Ô nhập voucher */}
            <div className="flex gap-2">
              <div className="h-10 flex-1 bg-zinc-100" />
              <div className="h-10 w-24 bg-zinc-200" />
            </div>

            {/* Bảng chi tiết tính tiền */}
            <div className="space-y-3 py-2 border-y border-zinc-200">
              <div className="flex justify-between">
                <div className="h-4 w-28 bg-zinc-100" />
                <div className="h-4 w-20 bg-zinc-200" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-zinc-100" />
                <div className="h-4 w-16 bg-zinc-200" />
              </div>
            </div>

            {/* Tổng thanh toán */}
            <div className="flex justify-between items-baseline pt-2">
              <div className="h-5 w-32 bg-zinc-200" />
              <div className="h-6 w-28 bg-zinc-300" />
            </div>

            {/* Nút đặt hàng to */}
            <div className="h-12 w-full bg-zinc-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
