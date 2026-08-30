"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ShoppingBag,
  Truck,
  RotateCcw,
  CreditCard,
  Crown,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Mail,
  MessageSquare,
} from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: FaqItem[];
}

const faqData: FaqCategory[] = [
  {
    id: "ordering",
    name: "Đơn hàng & Mua sắm",
    icon: <ShoppingBag className="w-4 h-4" />,
    items: [
      {
        question: "Làm thế nào để đặt hàng online tại THE LUKI?",
        answer:
          "Bạn chỉ cần chọn sản phẩm yêu thích ➔ Chọn màu sắc, kích thước (size) ➔ Bấm 'Thêm vào giỏ hàng' hoặc 'Mua ngay' ➔ Điền thông tin giao hàng và chọn phương thức thanh toán phù hợp ➔ Bấm 'Hoàn tất đơn hàng'. Sau khi đặt hàng thành công, hệ thống sẽ gửi email xác nhận và mã đơn hàng cho bạn.",
      },
      {
        question: "Tôi có thể thay đổi địa chỉ hoặc hủy đơn hàng sau khi đặt không?",
        answer:
          "Nếu đơn hàng của bạn đang ở trạng thái 'Chờ xác nhận' hoặc 'Đang xử lý', bạn có thể liên hệ ngay Hotline 0988 888 888 hoặc nhắn tin qua Fanpage/Website để nhân viên hỗ trợ đổi thông tin hoặc hủy đơn kịp thời trước khi đơn được bàn giao cho đơn vị vận chuyển.",
      },
      {
        question: "Làm sao để biết kích cỡ (size) nào vừa vặn với tôi?",
        answer:
          "Ở mỗi trang chi tiết sản phẩm, THE LUKI đều đính kèm 'Bảng hướng dẫn chọn size (Size Guide)' chi tiết theo chiều cao và cân nặng. Ngoài ra, bạn có thể bấm vào khung Chat trực tuyến để được chuyên viên tư vấn phom dáng chuẩn nhất.",
      },
      {
        question: "Làm cách nào để theo dõi tình trạng đơn hàng của tôi?",
        answer:
          "Bạn có thể vào mục 'Đơn hàng của tôi' trong trang Tài khoản cá nhân hoặc dùng 'Mã đơn hàng' tra cứu trực tiếp trên hệ thống để xem chi tiết lộ trình vận chuyển từ lúc đóng gói đến khi giao tận tay.",
      },
    ],
  },
  {
    id: "shipping",
    name: "Giao hàng & Vận chuyển",
    icon: <Truck className="w-4 h-4" />,
    items: [
      {
        question: "Thời gian và chi phí giao hàng là bao lâu?",
        answer:
          "• Khu vực TP. Hồ Chí Minh: Giao trong 1 - 2 ngày làm việc (Phí ship 20.000 VNĐ, Miễn phí cho đơn từ 499.000 VNĐ).\n• Các tỉnh thành khác: Giao trong 2 - 4 ngày làm việc (Phí ship 30.000 VNĐ, Miễn phí cho đơn từ 499.000 VNĐ hoặc thành viên hạng Gold trở lên).",
      },
      {
        question: "THE LUKI có dịch vụ giao hàng hỏa tốc trong ngày không?",
        answer:
          "Có! Đối với khách hàng tại khu vực nội thành TP. Hồ Chí Minh, THE LUKI hỗ trợ giao hàng hỏa tốc qua Grab/Ahamove trong vòng 2 - 4 tiếng. Bạn vui lòng liên hệ trực tiếp hotline hoặc chat để được báo phí ship hỏa tốc chính xác.",
      },
      {
        question: "Tôi có được kiểm tra hàng trước khi thanh toán (Đồng kiểm) không?",
        answer:
          "THE LUKI luôn khuyến khích khách hàng mở gói hàng kiểm tra đúng mẫu mã, màu sắc và số lượng sản phẩm trước khi thanh toán tiền cho nhân viên giao hàng (Shipper).",
      },
    ],
  },
  {
    id: "returns",
    name: "Đổi trả & Hoàn tiền",
    icon: <RotateCcw className="w-4 h-4" />,
    items: [
      {
        question: "Chính sách đổi trả sản phẩm quy định trong bao lâu?",
        answer:
          "THE LUKI hỗ trợ đổi hàng trong vòng 7 NGÀY kể từ ngày nhận hàng thành công đối với thành viên thông thường (và lên đến 15 - 30 ngày đối với thành viên hạng Platinum/Diamond).",
      },
      {
        question: "Điều kiện để sản phẩm được chấp nhận đổi trả là gì?",
        answer:
          "• Sản phẩm còn nguyên tem mác, thẻ bài, túi bọc và hóa đơn mua hàng.\n• Sản phẩm chưa qua sử dụng, chưa qua giặt ủi, không bị vấy bẩn hoặc có mùi lạ.\n• Sản phẩm không thuộc danh mục Sale thanh lý xả kho cuối mùa (có ghi chú rõ khi mua).",
      },
      {
        question: "Quy trình gửi hàng đổi trả diễn ra như thế nào?",
        answer:
          "Bạn chỉ cần nhắn tin cho Fanpage hoặc gọi hotline cung cấp mã đơn hàng. THE LUKI sẽ tạo đơn thu hồi tận nhà để shipper đến lấy hàng cũ và giao sản phẩm mới đổi cho bạn, bạn không cần phải tự mang hàng ra bưu cục.",
      },
    ],
  },
  {
    id: "payments",
    name: "Thanh toán & Bảo mật",
    icon: <CreditCard className="w-4 h-4" />,
    items: [
      {
        question: "THE LUKI hỗ trợ những hình thức thanh toán nào?",
        answer:
          "Chúng tôi hỗ trợ đa dạng phương thức thanh toán an toàn:\n1. Thanh toán khi nhận hàng (COD - Tiền mặt).\n2. Chuyển khoản ngân hàng qua mã VietQR tự động.\n3. Thanh toán thẻ ATM / Visa / Master qua cổng VNPAY.\n4. Ví điện tử MoMo, ZaloPay.",
      },
      {
        question: "Thông tin thanh toán và thẻ ngân hàng của tôi có được bảo mật không?",
        answer:
          "Hoàn toàn bảo mật! Mọi giao dịch trực tuyến trên THE LUKI đều được mã hóa bằng chuẩn bảo mật SSL HTTPS và xử lý qua các cổng thanh toán ngân hàng được cấp phép chuẩn PCI-DSS. Chúng tôi cam kết tuyệt đối không lưu trữ thông tin thẻ của khách hàng.",
      },
    ],
  },
  {
    id: "membership",
    name: "Hội viên & Điểm thưởng",
    icon: <Crown className="w-4 h-4" />,
    items: [
      {
        question: "Làm thế nào để tích lũy điểm và thăng hạng thành viên?",
        answer:
          "Khi có tài khoản tại THE LUKI, mỗi 10.000 VNĐ chi tiêu hoàn tất sẽ được quy đổi thành 1 Điểm tích lũy. Hệ thống sẽ tự động nâng hạng thẻ của bạn (Bronze, Silver, Gold, Platinum, Diamond, Black Diamond) và áp dụng chiết khấu tự động từ 3% đến 15% vào các đơn hàng kế tiếp.",
      },
      {
        question: "Ưu đãi sinh nhật thành viên được nhận như thế nào?",
        answer:
          "Vào đầu tháng sinh nhật của bạn, hệ thống THE LUKI sẽ tự động gửi mã Voucher sinh nhật (từ 50.000đ đến 500.000đ tùy theo hạng thẻ) vào mục 'Mã giảm giá của tôi' trong tài khoản và thông báo qua Email/SMS.",
      },
    ],
  },
];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ordering");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Lọc câu hỏi theo từ khóa tìm kiếm
  const filteredCategories = faqData
    .map((cat) => {
      const filteredItems = cat.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...cat, items: filteredItems };
    })
    .filter((cat) => cat.items.length > 0);

  const currentCategoryData = searchQuery.trim() !== "" 
    ? null 
    : faqData.find((cat) => cat.id === activeCategory);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* 1. Hero Header */}
      <section className="relative pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-neutral-100 bg-neutral-50/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 text-white text-[11px] uppercase tracking-widest font-semibold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>HỖ TRỢ KHÁCH HÀNG</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase font-sans text-neutral-900">
              CÂU HỎI THƯỜNG GẶP
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-light">
              Tìm câu trả lời nhanh chóng cho các thắc mắc về đơn hàng, vận chuyển, đổi trả và chính sách mua sắm tại THE LUKI.
            </p>

            {/* Search Input Box */}
            <div className="pt-4 max-w-xl mx-auto">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập từ khóa tìm kiếm (Ví dụ: đổi trả, phí ship, size...)"
                  className="w-full h-12 pl-11 pr-4 text-sm bg-white border border-neutral-200 hover:border-neutral-400 focus:border-neutral-900 text-neutral-900 outline-none rounded-none transition-colors shadow-sm placeholder:text-neutral-400"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-4 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 text-xs font-semibold text-neutral-400 hover:text-neutral-900"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <section className="py-14 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {searchQuery.trim() === "" ? (
          /* Khi không tìm kiếm: Hiển thị dạng Danh mục Tabs + Accordion */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Cột trái: Category Tabs */}
            <div className="lg:col-span-4 space-y-1.5">
              <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-bold px-4 mb-2 block">
                Chủ đề câu hỏi
              </span>
              {faqData.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full p-4 text-left text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-colors ${
                    activeCategory === cat.id
                      ? "bg-neutral-900 text-white shadow-md"
                      : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  <span className={activeCategory === cat.id ? "text-white" : "text-neutral-500"}>
                    {cat.icon}
                  </span>
                  <span>{cat.name}</span>
                </button>
              ))}

              {/* Box cần trợ giúp nhanh */}
              <div className="mt-8 p-6 bg-neutral-50 border border-neutral-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Cần hỗ trợ trực tiếp?
                </h4>
                <p className="text-xs text-neutral-500 font-light leading-relaxed">
                  Đội ngũ CSKH của THE LUKI luôn sẵn sàng giải đáp mọi thắc mắc từ 8:30 - 22:00 hàng ngày.
                </p>
                <div className="pt-1 space-y-2 text-xs font-semibold text-neutral-900">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Hotline: 0988 888 888</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Email: support@theluki.click</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Accordion Questions của Category được chọn */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-lg font-bold uppercase tracking-wider text-neutral-900 pb-2 border-b border-neutral-100">
                {currentCategoryData?.name}
              </h3>

              <div className="space-y-3.5">
                {currentCategoryData?.items.map((item, idx) => {
                  const itemKey = `${activeCategory}-${idx}`;
                  const isOpen = !!openItems[itemKey];

                  return (
                    <div
                      key={idx}
                      className="border border-neutral-200 bg-white transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(itemKey)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-neutral-900 hover:text-neutral-600 transition-colors"
                      >
                        <span>{item.question}</span>
                        <span className="shrink-0 text-neutral-400">
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-neutral-900" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-6 text-xs sm:text-sm text-neutral-600 font-light leading-relaxed border-t border-neutral-100 pt-4 whitespace-pre-line">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Khi đang tìm kiếm: Hiển thị kết quả tìm kiếm */
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-sm text-neutral-500">
              Kết quả tìm kiếm cho: <strong className="text-neutral-900">&ldquo;{searchQuery}&rdquo;</strong>
            </div>

            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <div key={cat.id} className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                    {cat.icon}
                    <span>{cat.name}</span>
                  </h4>

                  <div className="space-y-3">
                    {cat.items.map((item, idx) => {
                      const itemKey = `search-${cat.id}-${idx}`;
                      const isOpen = openItems[itemKey] !== false; // Mặc định mở khi search

                      return (
                        <div
                          key={idx}
                          className="border border-neutral-200 bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => toggleItem(itemKey)}
                            className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-neutral-900"
                          >
                            <span>{item.question}</span>
                            <span className="shrink-0 text-neutral-400">
                              {isOpen ? (
                                <ChevronUp className="w-4 h-4 text-neutral-900" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </span>
                          </button>

                          {isOpen && (
                            <div className="px-5 pb-6 text-xs sm:text-sm text-neutral-600 font-light leading-relaxed border-t border-neutral-100 pt-4 whitespace-pre-line">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 p-8 border border-dashed border-neutral-200 space-y-3">
                <HelpCircle className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="text-sm font-semibold text-neutral-900">Không tìm thấy câu trả lời phù hợp</p>
                <p className="text-xs text-neutral-500 font-light">
                  Vui lòng thử tìm với từ khóa khác hoặc liên hệ trực tiếp với chúng tôi để được giải đáp.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. Bottom CTA Contact Banner */}
      <section className="py-14 sm:py-16 bg-neutral-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            Vẫn chưa tìm được câu trả lời cho thắc mắc của bạn?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 font-light max-w-xl mx-auto">
            Đừng ngần ngại liên hệ với THE LUKI. Đội ngũ tư vấn luôn sẵn sàng lắng nghe và hỗ trợ bạn mọi lúc.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-bold uppercase tracking-wider">
            <a
              href="tel:0988888888"
              className="px-6 py-3 bg-white text-neutral-900 hover:bg-neutral-100 transition-colors inline-flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>GỌI HOTLINE</span>
            </a>
            <a
              href="mailto:support@theluki.click"
              className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-colors inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>GỬI EMAIL</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
