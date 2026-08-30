import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Crown, 
  Gift, 
  Sparkles, 
  Truck, 
  BadgePercent, 
  ShieldCheck, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export const metadata = {
  title: "Chính sách thành viên | THE LUKI CLUB",
  description: "Trở thành hội viên THE LUKI CLUB để tận hưởng hàng loạt đặc quyền mua sắm, chiết khấu độc quyền và quà tặng sinh nhật cao cấp.",
};

const tiers = [
  {
    name: "NEWBIE",
    vnName: "Thành viên mới",
    spending: "0 VNĐ",
    points: "0 điểm",
    badgeColor: "bg-neutral-100 text-neutral-800 border-neutral-200",
    discount: "Voucher 10% đơn đầu",
    perks: [
      "Voucher giảm 10% cho đơn hàng đầu tiên",
      "Tích lũy 1% giá trị mỗi đơn hàng thành công",
      "Nhận thông báo ưu đãi độc quyền qua Email/SMS",
    ],
    highlight: false,
  },
  {
    name: "BRONZE",
    vnName: "Hạng Đồng",
    spending: "1.000.000 VNĐ",
    points: "100 điểm",
    badgeColor: "bg-amber-900/10 text-amber-900 border-amber-900/20",
    discount: "Giảm 3% mọi đơn",
    perks: [
      "Chiết khấu trực tiếp 3% cho mọi đơn hàng",
      "Voucher quà tặng sinh nhật 50.000 VNĐ",
      "Freeship toàn quốc cho đơn từ 499.000 VNĐ",
      "Tích lũy 1% giá trị mỗi đơn hàng",
    ],
    highlight: false,
  },
  {
    name: "SILVER",
    vnName: "Hạng Bạc",
    spending: "3.000.000 VNĐ",
    points: "300 điểm",
    badgeColor: "bg-slate-200/60 text-slate-800 border-slate-300",
    discount: "Giảm 5% mọi đơn",
    perks: [
      "Chiết khấu trực tiếp 5% cho mọi đơn hàng",
      "Voucher quà tặng sinh nhật 100.000 VNĐ",
      "Freeship toàn quốc cho đơn từ 399.000 VNĐ",
      "Ưu tiên hỗ trợ đổi size/mẫu trong vòng 7 ngày",
    ],
    highlight: false,
  },
  {
    name: "GOLD",
    vnName: "Hạng Vàng",
    spending: "7.000.000 VNĐ",
    points: "700 điểm",
    badgeColor: "bg-yellow-500/15 text-yellow-900 border-yellow-500/30",
    discount: "Giảm 8% mọi đơn",
    perks: [
      "Chiết khấu trực tiếp 8% cho mọi đơn hàng",
      "Voucher quà tặng sinh nhật 200.000 VNĐ",
      "Miễn phí vận chuyển toàn quốc MỌI ĐƠN HÀNG",
      "Được quyền mua sớm Bộ sưu tập mới (Early Access)",
    ],
    highlight: true,
  },
  {
    name: "PLATINUM",
    vnName: "Bạch Kim",
    spending: "15.000.000 VNĐ",
    points: "1.500 điểm",
    badgeColor: "bg-cyan-950/10 text-cyan-950 border-cyan-950/20",
    discount: "Giảm 10% mọi đơn",
    perks: [
      "Chiết khấu trực tiếp 10% cho mọi đơn hàng",
      "Voucher quà tặng sinh nhật 300.000 VNĐ",
      "Freeship hỏa tốc và giao hàng ưu tiên",
      "Hỗ trợ đổi trả miễn phí tận nhà trong 15 ngày",
      "Chuyên viên chăm sóc khách hàng ưu tiên 1-1",
    ],
    highlight: false,
  },
  {
    name: "DIAMOND",
    vnName: "Kim Cương",
    spending: "30.000.000 VNĐ",
    points: "3.000 điểm",
    badgeColor: "bg-indigo-950/10 text-indigo-950 border-indigo-950/20",
    discount: "Giảm 12% mọi đơn",
    perks: [
      "Chiết khấu trực tiếp 12% cho mọi đơn hàng",
      "Hộp quà sinh nhật đặc biệt trị giá 500.000 VNĐ",
      "Freeship toàn quốc không giới hạn số lần",
      "Quyền thử nghiệm và đặt trước bản giới hạn (Limited)",
      "Đổi trả không giới hạn lý do trong 30 ngày",
    ],
    highlight: false,
  },
  {
    name: "BLACK DIAMOND",
    vnName: "Kim Cương Đen (Tối Thượng)",
    spending: "60.000.000 VNĐ",
    points: "6.000 điểm",
    badgeColor: "bg-neutral-900 text-white border-neutral-900",
    discount: "Giảm 15% trọn đời",
    perks: [
      "Chiết khấu trực tiếp 15% trọn đời mọi đơn hàng",
      "Quà tặng tri ân thường niên (Premium Luxury Gift Box)",
      "Thiệp mời VIP tham dự Private Fashion Show & Workshop",
      "Hotline chăm sóc khách hàng VIP riêng 24/7",
      "Dịch vụ may đo / chỉnh sửa phom dáng miễn phí trọn đời",
    ],
    highlight: true,
  },
];

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Hero Banner Section */}
      <section className="relative pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-neutral-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-900 text-[11px] uppercase tracking-widest font-semibold">
              <Crown className="w-3.5 h-3.5" />
              <span>THE LUKI REWARDS CLUB</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase font-sans text-neutral-900">
              CHÍNH SÁCH THÀNH VIÊN
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-light">
              Tích lũy chi tiêu - Nâng tầm đặc quyền. Trải nghiệm dịch vụ mua sắm xứng tầm cùng những ưu đãi chiết khấu độc quyền chỉ dành riêng cho bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Banner Image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8">
        <div className="relative aspect-[16/7] sm:aspect-[21/9] w-full overflow-hidden bg-neutral-100 shadow-2xl group border border-neutral-200">
          <Image
            src="/membersgip/image.png"
            alt="THE LUKI Membership Privileges"
            fill
            priority
            className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 sm:p-10">
            <div className="text-white space-y-2 max-w-xl">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-amber-400">
                Exclusive Lifestyle
              </span>
              <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight">
                Mỗi đơn hàng là một bước thăng hạng
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Quick Benefits */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-6 bg-neutral-50 border border-neutral-200/60">
            <div className="w-12 h-12 bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <BadgePercent className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Chiết khấu trực tiếp</h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                Giảm tự động lên đến 15% vào mọi đơn hàng khi đạt các mốc hạng thẻ tương ứng.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-neutral-50 border border-neutral-200/60">
            <div className="w-12 h-12 bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Quà tặng sinh nhật</h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                Nhận voucher hoặc quà tặng cao cấp trao tận tay vào tháng sinh nhật của bạn.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-neutral-50 border border-neutral-200/60">
            <div className="w-12 h-12 bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Miễn phí vận chuyển</h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                Freeship toàn quốc từ hạng GOLD và hỗ trợ đổi hàng tận nơi nhanh chóng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7 Membership Tiers Grid */}
      <section className="py-16 sm:py-20 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-semibold">
              Tier Structure
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight uppercase text-neutral-900">
              BẢNG PHÂN HẠNG THÀNH VIÊN
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-light">
              Mỗi 10.000 VNĐ chi tiêu = 1 Điểm tích lũy. Hạng thẻ được cập nhật tự động ngay khi giao hàng thành công.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col justify-between p-6 sm:p-7 bg-white transition-all duration-300 ${
                  tier.highlight
                    ? "border-2 border-neutral-900 shadow-xl"
                    : "border border-neutral-200/80 hover:border-neutral-900 hover:shadow-lg"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-6 px-2.5 py-0.5 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-widest">
                    Đặc biệt
                  </span>
                )}

                <div className="space-y-4">
                  {/* Header Tier */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black tracking-wider uppercase text-neutral-900">
                        {tier.name}
                      </h3>
                      <p className="text-xs text-neutral-500">{tier.vnName}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${tier.badgeColor}`}>
                      {tier.discount}
                    </span>
                  </div>

                  {/* Spending requirement */}
                  <div className="py-3 border-y border-neutral-100 space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                      Mức chi tiêu tích lũy
                    </p>
                    <p className="text-base sm:text-lg font-black text-neutral-900">
                      {tier.spending}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      ({tier.points})
                    </p>
                  </div>

                  {/* Perks List */}
                  <div className="space-y-2.5 pt-2">
                    <p className="text-[11px] uppercase tracking-widest text-neutral-900 font-bold">
                      Quyền lợi:
                    </p>
                    <ul className="space-y-2">
                      {tier.perks.map((perk, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-neutral-600 font-light leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 shrink-0 mt-0.5" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-neutral-100">
                  <Link
                    href="/register"
                    className={`w-full py-2.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors ${
                      tier.highlight
                        ? "bg-neutral-900 text-white hover:bg-neutral-800"
                        : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                    }`}
                  >
                    <span>Tham gia ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules & Policy Accordion / Steps */}
      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-semibold">
            Terms & FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-neutral-900">
            QUY ĐỊNH & CÂU HỎI THƯỜNG GẶP
          </h2>
        </div>

        <div className="space-y-6">
          <div className="p-6 border border-neutral-200 space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              1. Làm thế nào để được tính điểm và lên hạng?
            </h4>
            <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
              Bạn chỉ cần đăng ký tài khoản tại THE LUKI và đăng nhập khi mua sắm. Mỗi khi đơn hàng hoàn tất và thanh toán thành công, hệ thống sẽ tự động quy đổi: <strong>10.000 VNĐ = 1 Điểm</strong> và nâng hạng cho bạn ngay lập tức.
            </p>
          </div>

          <div className="p-6 border border-neutral-200 space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              2. Điểm tích lũy và Hạng thành viên có thời hạn không?
            </h4>
            <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
              Hạng thành viên của bạn được <strong>duy trì trong 12 tháng</strong> kể từ ngày thăng hạng. Trong 12 tháng, bạn chỉ cần phát sinh ít nhất 1 đơn hàng bất kỳ để tiếp tục gia hạn quyền lợi thành viên trọn đời.
            </p>
          </div>

          <div className="p-6 border border-neutral-200 space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              3. Ưu đãi chiết khấu thành viên có áp dụng cùng các khuyến mãi khác không?
            </h4>
            <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
              Chiết khấu thành viên được áp dụng trực tiếp trên hầu hết các sản phẩm nguyên giá. Đối với các chương trình Flash Sale lớn hoặc mã giảm giá đặc biệt, hệ thống sẽ tự động chọn mức giảm cao nhất có lợi nhất cho bạn.
            </p>
          </div>
        </div>

        <div className="text-center pt-6">
          <Link
            href="/product"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-bold transition-all hover:shadow-lg active:scale-95"
          >
            BẮT ĐẦU MUA SẮM VÀ TÍCH ĐIỂM
          </Link>
        </div>
      </section>
    </div>
  );
}
