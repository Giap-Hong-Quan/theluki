"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  DollarSign,
  Send,
  GraduationCap,
  TrendingUp,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";

interface JobPosition {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  salary: string;
  deadline: string;
  description: string[];
  requirements: string[];
  benefits: string[];
}

const jobList: JobPosition[] = [
  {
    id: "job-1",
    title: "Nhân viên Tư vấn Bán hàng (Fashion Consultant)",
    department: "Cửa hàng (Retail)",
    type: "Full-time / Part-time",
    location: "TP. Hồ Chí Minh",
    salary: "7.000.000 - 12.000.000 VNĐ (Lương cứng + Thưởng DS)",
    deadline: "Tuyển liên tục",
    description: [
      "Đón tiếp, tư vấn phối đồ và hỗ trợ khách hàng trải nghiệm mua sắm tại cửa hàng.",
      "Sắp xếp, trưng bày sản phẩm theo quy chuẩn thẩm mỹ của THE LUKI.",
      "Kiểm kê hàng hóa, bảo quản sản phẩm và giữ gìn không gian cửa hàng luôn sạch đẹp, ngăn nắp.",
      "Thực hiện thanh toán và hỗ trợ khách hàng đăng ký hội viên.",
    ],
    requirements: [
      "Nam/Nữ từ 18 - 25 tuổi, ngoại hình sáng, tác phong chỉn chu.",
      "Giao tiếp thân thiện, năng động, có gu thời trang là một lợi thế.",
      "Trung thực, có tinh thần trách nhiệm và chịu khó học hỏi.",
      "Có thể xoay ca làm việc linh hoạt (Ca sáng / Ca tối).",
    ],
    benefits: [
      "Thu nhập hấp dẫn: Lương cơ bản + Thưởng % Doanh số + Thưởng KPIs tháng.",
      "Được cấp đồng phục thiết kế độc quyền của THE LUKI.",
      "Chiết khấu ưu đãi mua sắm nội bộ lên đến 40% - 50%.",
      "Cơ hội thăng tiến lên Cửa hàng phó / Cửa hàng trưởng sau 3 - 6 tháng.",
    ],
  },
  {
    id: "job-2",
    title: "Chuyên viên Sáng tạo Nội dung & Stylist (Content Creator)",
    department: "Marketing & Media",
    type: "Full-time",
    location: "TP. Hồ Chí Minh",
    salary: "10.000.000 - 16.000.000 VNĐ",
    deadline: "Tuyển liên tục",
    description: [
      "Lên ý tưởng, kịch bản và sản xuất video TikTok/Reels/Shorts thời trang bắt trend.",
      "Phối đồ (styling), hỗ trợ các buổi chụp lookbook và photoshoot sản phẩm mới.",
      "Phối hợp với team Marketing triển khai các chiến dịch ra mắt Bộ sưu tập mới.",
    ],
    requirements: [
      "Có gu thẩm mỹ tốt, nắm bắt nhanh các xu hướng thời trang trẻ.",
      "Tự tin trước ống kính, có khả năng diễn đạt lưu loát và sáng tạo nội dung.",
      "Biết sử dụng cơ bản các phần mềm chỉnh sửa ảnh/video (CapCut, Premiere, Photoshop...).",
      "Đính kèm Portfolio hoặc kênh TikTok/Instagram cá nhân khi nộp CV.",
    ],
    benefits: [
      "Môi trường làm việc trẻ trung, tự do sáng tạo và khẳng định phong cách riêng.",
      "Thưởng dự án theo hiệu quả viral của video và doanh số chiến dịch.",
      "Được tham gia các sự kiện thời trang, workshop chuyên nghiệp.",
      "Review tăng lương định kỳ 6 tháng/lần.",
    ],
  },
  {
    id: "job-3",
    title: "Nhân viên Vận hành Kho & Đóng gói (E-commerce Fulfillment)",
    department: "Kho vận & Hậu cần",
    type: "Full-time",
    location: "TP. Hồ Chí Minh",
    salary: "8.000.000 - 11.000.000 VNĐ",
    deadline: "Tuyển liên tục",
    description: [
      "Tiếp nhận đơn hàng online từ Website, Shopee, TikTok Shop.",
      "Kiểm tra chất lượng sản phẩm, là ủi và đóng gói cẩn thận chuẩn quy cách THE LUKI.",
      "Bàn giao đơn hàng cho các đơn vị vận chuyển (ViettelPost, GHN...).",
      "Nhập xuất hàng hóa và sắp xếp kho bãi khoa học.",
    ],
    requirements: [
      "Cẩn thận, tỉ mỉ, có trách nhiệm cao với đơn hàng.",
      "Sức khỏe tốt, nhanh nhẹn và trung thực.",
      "Ưu tiên ứng viên có kinh nghiệm đóng gói kho thời trang thương mại điện tử.",
    ],
    benefits: [
      "Lương cứng ổn định + Thưởng sản lượng đóng gói theo ngày/tháng.",
      "Đóng BHXH, BHYT đầy đủ sau thời gian thử việc.",
      "Phụ cấp ăn trưa, gửi xe và thưởng chuyên cần.",
    ],
  },
  {
    id: "job-4",
    title: "Nhân viên Chăm sóc Khách hàng Online (Customer Care)",
    department: "Kinh doanh Online",
    type: "Full-time / Xoay ca",
    location: "TP. Hồ Chí Minh (hoặc Hybrid)",
    salary: "7.500.000 - 12.000.000 VNĐ",
    deadline: "Tuyển liên tục",
    description: [
      "Trực chat tư vấn size, mẫu mã và chốt đơn trên Website, Fanpage, Instagram.",
      "Xử lý các yêu cầu đổi trả, khiếu nại của khách hàng với thái độ lịch sự, chuyên nghiệp.",
      "Chăm sóc khách hàng sau mua và hỗ trợ các chương trình khuyến mãi.",
    ],
    requirements: [
      "Kỹ năng đánh máy nhanh, hoạt ngôn, xử lý tình huống khéo léo.",
      "Giọng văn tư vấn nhẹ nhàng, lễ phép và chuẩn chính tả.",
      "Chịu được áp lực mùa sale và có tinh thần làm việc nhóm.",
    ],
    benefits: [
      "Hoa hồng theo tỷ lệ chuyển đổi chốt đơn thành công.",
      "Trang bị máy tính và thiết bị làm việc đầy đủ.",
      "Được đào tạo kỹ năng bán hàng và thấu hiểu tâm lý khách hàng chuyên sâu.",
    ],
  },
];

const faqs = [
  {
    question: "Thời gian làm việc tại THE LUKI?",
    answer:
      "Đối với khối Văn phòng (Marketing, Design, E-commerce): Làm việc từ Thứ 2 đến Thứ 6 (8:30 - 17:30) và sáng Thứ 7. Đối với khối Cửa hàng & Kho vận: Làm việc theo ca (Ca sáng: 8:30 - 15:30, Ca tối: 15:00 - 22:00) với 1 ngày nghỉ tự chọn/tuần.",
  },
  {
    question: "Nhân viên có được đào tạo khi mới vào làm không?",
    answer:
      "Tất cả nhân viên mới tại THE LUKI đều được tham gia khóa đào tạo hội nhập bài bản trong 1 - 2 tuần đầu. Bạn sẽ được hướng dẫn kiến thức về chất liệu vải, quy chuẩn dịch vụ khách hàng cao cấp, văn hóa thương hiệu và quy trình làm việc cùng một người hướng dẫn (Mentor) kèm cặp 1-1.",
  },
  {
    question: "Ứng tuyển nhiều vị trí cùng lúc được không?",
    answer:
      "Bạn hoàn toàn có thể nộp đơn cho nhiều vị trí phù hợp với năng lực và nguyện vọng của mình. Đội ngũ Tuyển dụng sẽ đánh giá hồ sơ và định hướng cho bạn vị trí phát huy tốt nhất thế mạnh của bạn.",
  },
  {
    question: "Chính sách đãi ngộ có gì nổi bật?",
    answer:
      "THE LUKI mang đến gói đãi ngộ hấp dẫn bao gồm: Lương thưởng cạnh tranh theo hiệu suất, thưởng Lễ/Tết/Lương tháng 13, chiết khấu mua sắm nội bộ từ 40% - 50%, cấp đồng phục miễn phí, chế độ BHXH đầy đủ và các chuyến du lịch / Team building hàng năm.",
  },
  {
    question: "Cơ hội phát triển nghề nghiệp ra sao?",
    answer:
      "Tại THE LUKI, chúng tôi ưu tiên phát triển nhân sự từ nội bộ với lộ trình thăng tiến minh bạch. Nhân viên bán hàng có thể phát triển lên Cửa hàng phó, Cửa hàng trưởng hoặc Quản lý khu vực sau 6 - 12 tháng dựa trên kết quả đánh giá năng lực.",
  },
  {
    question: "Sau khi ứng tuyển, bao lâu sẽ nhận được phản hồi?",
    answer:
      "Bộ phận Tuyển dụng của THE LUKI sẽ liên hệ lại qua Email hoặc Số điện thoại trong vòng 2 - 4 ngày làm việc kể từ khi nhận được CV của bạn nếu hồ sơ phù hợp để sắp xếp lịch phỏng vấn.",
  },
];

export default function RecruitmentPage() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleJob = (id: string) => {
    setSelectedJob(selectedJob === id ? null : id);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* 1. Hero Section */}
      <section className="relative pt-14 pb-16 sm:pt-20 sm:pb-24 border-b border-neutral-100 bg-neutral-50/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 text-white text-[11px] uppercase tracking-widest font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>CAREERS AT THE LUKI</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase font-sans text-neutral-900">
              TUYỂN DỤNG NHÂN TÀI
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-light">
              Hãy trở thành một phần của đại gia đình THE LUKI, nơi đam mê thời trang đương đại kết hợp cùng môi trường làm việc sáng tạo, chuyên nghiệp và đầy tiềm năng phát triển.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Tại sao chọn THE LUKI? (Why Join Us) */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-semibold">
            Work Culture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
            VÌ SAO BẠN NÊN GIA NHẬP THE LUKI?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 border border-neutral-200/80 bg-white space-y-3.5 hover:border-neutral-900 transition-colors">
            <div className="w-11 h-11 bg-neutral-900 text-white flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900">
              Lộ trình thăng tiến rõ ràng
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed">
              Đánh giá năng lực công bằng, minh bạch định kỳ 6 tháng. Cơ hội phát triển lên các vị trí Quản lý / Leader nhanh chóng.
            </p>
          </div>

          <div className="p-8 border border-neutral-200/80 bg-white space-y-3.5 hover:border-neutral-900 transition-colors">
            <div className="w-11 h-11 bg-neutral-900 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900">
              Đãi ngộ & Quyền lợi vượt trội
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed">
              Mức lương thưởng cạnh tranh, thưởng doanh số nóng hàng tuần, ưu đãi chiết khấu 40 - 50% sản phẩm nội bộ và teambuilding thường niên.
            </p>
          </div>

          <div className="p-8 border border-neutral-200/80 bg-white space-y-3.5 hover:border-neutral-900 transition-colors">
            <div className="w-11 h-11 bg-neutral-900 text-white flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900">
              Môi trường trẻ & Tôn trọng cá tính
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed">
              Không gò bó ý tưởng, văn hóa làm việc năng động, lắng nghe và luôn khuyến khích mọi thành viên bộc lộ gu thẩm mỹ cá nhân.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Danh sách vị trí việc làm thường xuyên (Open Positions) */}
      <section className="py-16 sm:py-24 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-semibold">
                Join Our Team
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight uppercase text-neutral-900">
                VỊ TRÍ TUYỂN DỤNG THƯỜNG XUYÊN
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md font-light">
              Chọn vị trí phù hợp với thế mạnh của bạn để xem chi tiết mô tả công việc và nộp hồ sơ ứng tuyển.
            </p>
          </div>

          <div className="space-y-4">
            {jobList.map((job) => {
              const isOpen = selectedJob === job.id;
              return (
                <div
                  key={job.id}
                  className="bg-white border border-neutral-200 overflow-hidden transition-all duration-200"
                >
                  {/* Job Header Summary */}
                  <div
                    onClick={() => toggleJob(job.id)}
                    className="p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/80 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-neutral-100 text-neutral-800 text-[10px] uppercase font-bold tracking-wider">
                          {job.department}
                        </span>
                        <span className="px-2.5 py-0.5 bg-neutral-900 text-white text-[10px] uppercase font-bold tracking-wider">
                          {job.type}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-neutral-900">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-neutral-900 font-semibold">
                          <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          Hạn nộp: {job.deadline}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pt-2 lg:pt-0">
                      <button
                        type="button"
                        className="px-5 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5"
                      >
                        <span>{isOpen ? "Thu gọn" : "Xem chi tiết"}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Job Details Expansion */}
                  {isOpen && (
                    <div className="px-6 pb-8 pt-2 sm:px-7 border-t border-neutral-100 space-y-6 text-sm text-neutral-700 font-light bg-neutral-50/40">
                      {/* Mô tả công việc */}
                      <div className="space-y-2 pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>1. Mô tả công việc:</span>
                        </h4>
                        <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm text-neutral-600 pl-1">
                          {job.description.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Yêu cầu ứng viên */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>2. Yêu cầu ứng viên:</span>
                        </h4>
                        <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm text-neutral-600 pl-1">
                          {job.requirements.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Quyền lợi */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>3. Quyền lợi được hưởng:</span>
                        </h4>
                        <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm text-neutral-600 pl-1">
                          {job.benefits.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA nộp hồ sơ */}
                      <div className="pt-4 border-t border-neutral-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-neutral-500">
                          Gửi CV về email: <strong className="text-neutral-900">tuyendung@theluki.click</strong> (Tiêu đề: [Họ tên - Vị trí ứng tuyển])
                        </div>
                        <a
                          href={`mailto:tuyendung@theluki.click?subject=Ứng tuyển vị trí ${encodeURIComponent(job.title)}`}
                          className="w-full sm:w-auto px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>NỘP HỒ SƠ ỨNG TUYỂN NGAY</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Quy trình ứng tuyển 4 bước (Hiring Process) */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-semibold">
            Simple 4 Steps
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
            QUY TRÌNH ỨNG TUYỂN
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="relative p-6 border border-neutral-200 bg-white space-y-3">
            <span className="text-3xl font-black text-neutral-200 block">01</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Nộp hồ sơ (CV Online)
            </h3>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Gửi CV cá nhân hoặc Portfolio trực tiếp qua email tuyển dụng của THE LUKI.
            </p>
          </div>

          <div className="relative p-6 border border-neutral-200 bg-white space-y-3">
            <span className="text-3xl font-black text-neutral-200 block">02</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Sàng lọc & Phỏng vấn
            </h3>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Bộ phận Tuyển dụng liên hệ trao đổi online hoặc phỏng vấn trực tiếp tại văn phòng.
            </p>
          </div>

          <div className="relative p-6 border border-neutral-200 bg-white space-y-3">
            <span className="text-3xl font-black text-neutral-200 block">03</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Đào tạo & Thử việc
            </h3>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Tham gia khóa đào tạo hội nhập chuyên nghiệp và trải nghiệm thực tế cùng Mentor.
            </p>
          </div>

          <div className="relative p-6 border border-neutral-200 bg-white space-y-3">
            <span className="text-3xl font-black text-neutral-900 block">04</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Gia nhập chính thức
            </h3>
            <p className="text-xs text-neutral-500 font-light leading-relaxed">
              Ký hợp đồng lao động chính thức, nhận trọn bộ quà chào đón (Welcome Kit) và phúc lợi.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Câu hỏi thường gặp khi ứng tuyển (FAQ Accordion) */}
      <section className="py-16 sm:py-24 bg-neutral-50 border-t border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-semibold">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
              CÂU HỎI THƯỜNG GẶP
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-neutral-200 bg-white transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-neutral-900 hover:text-neutral-600 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className="shrink-0 text-neutral-400">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-neutral-900" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-neutral-600 font-light leading-relaxed border-t border-neutral-100 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contact Box */}
          <div className="p-8 bg-neutral-900 text-white text-center space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider">
              Bạn có câu hỏi khác về việc làm tại THE LUKI?
            </h3>
            <p className="text-xs text-neutral-400 max-w-lg mx-auto font-light">
              Liên hệ ngay với bộ phận Nhân sự của chúng tôi qua Hotline hoặc gửi thư trực tiếp về hòm thư tuyển dụng.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
              <span className="px-4 py-2 bg-neutral-800 border border-neutral-700">
                Hotline: 0988 888 888
              </span>
              <span className="px-4 py-2 bg-neutral-800 border border-neutral-700">
                Email: tuyendung@theluki.click
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
