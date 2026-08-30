import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShieldCheck, HeartHandshake, Compass } from "lucide-react";

export const metadata = {
  title: "Về chúng tôi | THE LUKI - Contemporary Minimalist Fashion",
  description: "Khám phá câu chuyện thương hiệu, triết lý thiết kế và sứ mệnh định hình phong cách thời trang tối giản, cao cấp của THE LUKI.",
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Hero Section */}
      <section className="relative pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-neutral-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[11px] uppercase tracking-[0.4em] text-neutral-400 font-semibold inline-block">
              Our Story & Philosophy
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase font-sans text-neutral-900">
              VỀ THE LUKI
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-light">
              Định nghĩa lại phong cách thời trang đương đại qua lăng kính tối giản, tinh tế và tôn vinh nét đẹp nguyên bản của chính bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Main Story & Visual Banner 1 */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Cột chữ Story */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-800 text-[11px] uppercase tracking-widest font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Khởi nguồn cảm hứng</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase leading-tight text-neutral-900">
              Thời trang không chỉ là trang phục, mà là một lối sống.
            </h2>

            <div className="space-y-4 text-neutral-600 text-sm sm:text-base leading-relaxed font-light">
              <p>
                Ra đời từ niềm đam mê với nghệ thuật tối giản hiện đại, <strong className="font-semibold text-neutral-900">THE LUKI</strong> mang trong mình sứ mệnh mang đến những thiết kế trang phục vừa vặn hoàn hảo, nơi từng đường may, chất liệu vải và phom dáng đều được chọn lọc kỹ lưỡng.
              </p>
              <p>
                Chúng tôi tin rằng sự tự tin thực sự đến từ sự thoải mái và tự nhiên nhất. Không cần quá cầu kỳ hay rườm rà, mỗi sản phẩm của THE LUKI là bản tuyên ngôn của vẻ đẹp thanh lịch, vượt thời gian và trường tồn qua mọi mùa mốt.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 gap-6">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-neutral-900">100%</p>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">Chất liệu cao cấp</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-neutral-900">10K+</p>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">Khách hàng tin tưởng</p>
              </div>
            </div>
          </div>

          {/* Cột ảnh 1 (content.png) */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-neutral-100 shadow-xl group">
              <Image
                src="/about/content.png"
                alt="THE LUKI Brand Story"
                fill
                priority
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-neutral-950/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Quote Banner Section */}
      <section className="bg-neutral-900 text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 font-medium">
            Triết lý thiết kế
          </p>
          <blockquote className="text-xl sm:text-3xl lg:text-4xl font-light italic leading-snug tracking-wide">
            &ldquo;Sự đơn giản là đỉnh cao của sự tinh tế.&rdquo;
          </blockquote>
          <div className="w-12 h-[1px] bg-neutral-600 mx-auto" />
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
            THE LUKI CREATIVE STUDIO
          </p>
        </div>
      </section>

      {/* Story Part 2 & Visual Banner 2 (anh2.png) */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Cột ảnh 2 (anh2.png) */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-neutral-100 shadow-xl group">
              <Image
                src="/about/anh2.png"
                alt="THE LUKI Lookbook Experience"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-neutral-950/10" />
            </div>
          </div>

          {/* Cột chữ Giá trị */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-800 text-[11px] uppercase tracking-widest font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Chất lượng & Trải nghiệm</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase leading-tight text-neutral-900">
              Tỉ mỉ trong từng đường kim mũi chỉ
            </h2>

            <div className="space-y-4 text-neutral-600 text-sm sm:text-base leading-relaxed font-light">
              <p>
                Tại THE LUKI, chúng tôi không ngừng cải tiến quy trình thiết kế và sản xuất. Từ việc thử nghiệm vải mẫu, định hình đường cắt may ôm dáng tự nhiên cho tới khâu kiểm duyệt đóng gói thành phẩm, mỗi chi tiết đều được chăm chút với tiêu chuẩn khắt khe nhất.
              </p>
              <p>
                Chúng tôi mong muốn khi bạn khoác lên mình trang phục THE LUKI, bạn không chỉ cảm nhận được sự mềm mại, thoáng mát mà còn cảm nhận được sự chỉn chu và tâm huyết của đội ngũ sáng tạo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Values Grid */}
      <section className="py-16 sm:py-24 bg-neutral-50 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-semibold">
              Core Principles
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-neutral-900">
              GIÁ TRỊ CỐT LÕI
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {/* Card 1 */}
            <div className="bg-white p-8 border border-neutral-200/70 hover:border-neutral-900 transition-colors duration-300 space-y-4">
              <div className="w-10 h-10 bg-neutral-900 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold uppercase tracking-wider text-neutral-900">
                Thiết kế tối giản
              </h4>
              <p className="text-sm text-neutral-500 leading-relaxed font-light">
                Loại bỏ các chi tiết thừa thãi để tập trung vào phom dáng chuẩn xác, dễ dàng phối đồ và luôn hợp thời.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 border border-neutral-200/70 hover:border-neutral-900 transition-colors duration-300 space-y-4">
              <div className="w-10 h-10 bg-neutral-900 text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold uppercase tracking-wider text-neutral-900">
                Chất lượng hàng đầu
              </h4>
              <p className="text-sm text-neutral-500 leading-relaxed font-light">
                Cam kết sử dụng chất liệu vải thân thiện với làn da, thoáng khí, bền màu và giữ dáng sau nhiều lần giặt.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 border border-neutral-200/70 hover:border-neutral-900 transition-colors duration-300 space-y-4">
              <div className="w-10 h-10 bg-neutral-900 text-white flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold uppercase tracking-wider text-neutral-900">
                Đồng hành cùng khách hàng
              </h4>
              <p className="text-sm text-neutral-500 leading-relaxed font-light">
                Lắng nghe mọi phản hồi, chính sách đổi trả minh bạch và dịch vụ chăm sóc tận tâm trước và sau khi mua sắm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
            Khám phá bộ sưu tập mới nhất
          </h3>
          <p className="text-sm text-neutral-500 font-light">
            Trải nghiệm phong cách thời trang tối giản đương đại cùng THE LUKI ngay hôm nay.
          </p>
          <div>
            <Link
              href="/product"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-bold transition-all hover:shadow-lg active:scale-95"
            >
              MUA SẮM NGAY
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
