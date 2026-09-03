import { useState } from "react";
import { Form, Input, Select, Button, ConfigProvider, Switch } from "antd";
import { Download, Mail, Plus, Search, RotateCcw, Pencil, Trash2 } from "lucide-react";
import CardItem from "../../components/common/CardItem";
import Table, { type ColumnType } from "../../components/common/Table";
import Pagination from "../../components/common/Pagination";
import { useGetAllUsers } from "../../hook/useUser";
import type { UserItem } from "../../types/userType";

const CUSTOMER_DATA: any[] = [
  {
    id: "KH-18402",
    name: "Nguyễn Minh Anh",
    phone: "0912345678",
    tier: "Vàng",
    orders: 14,
    spent: "23,4trđ",
    aov: "1.671.000đ",
    points: "2.480",
    lastOrder: "21/08/2026",
  },
  {
    id: "KH-18388",
    name: "Trần Quốc Bảo",
    phone: "0938111222",
    tier: "Bạc",
    orders: 8,
    spent: "11,2trđ",
    aov: "1.400.000đ",
    points: "1.120",
    lastOrder: "24/08/2026",
  },
  {
    id: "KH-18201",
    name: "Lê Hoài Thu",
    phone: "0907654321",
    tier: "Kim cương",
    orders: 32,
    spent: "64,8trđ",
    aov: "2.025.000đ",
    points: "6.480",
    lastOrder: "23/08/2026",
  },
  {
    id: "KH-17984",
    name: "Phạm Gia Hân",
    phone: "0981234567",
    tier: "Đồng",
    orders: 3,
    spent: "2,1trđ",
    aov: "700.000đ",
    points: "210",
    lastOrder: "23/08/2026",
  },
  {
    id: "KH-17766",
    name: "Vũ Đức Thắng",
    phone: "0913888999",
    tier: "Vàng",
    orders: 18,
    spent: "28,6trđ",
    aov: "1.589.000đ",
    points: "2.860",
    lastOrder: "23/08/2026",
  },
  {
    id: "KH-17402",
    name: "Đỗ Thanh Mai",
    phone: "0977222333",
    tier: "Bạc",
    orders: 9,
    spent: "9,8trđ",
    aov: "1.089.000đ",
    points: "980",
    lastOrder: "22/08/2026",
  },
  {
    id: "KH-16988",
    name: "Bùi Khánh Linh",
    phone: "0966444555",
    tier: "Vàng",
    orders: 15,
    spent: "21,4trđ",
    aov: "1.427.000đ",
    points: "2.140",
    lastOrder: "22/08/2026",
  },
  {
    id: "KH-16512",
    name: "Hoàng Nam Sơn",
    phone: "0944666777",
    tier: "Đồng",
    orders: 2,
    spent: "3,1trđ",
    aov: "1.550.000đ",
    points: "310",
    lastOrder: "21/08/2026",
  },
  {
    id: "KH-16230",
    name: "Ngô Nhật Quang",
    phone: "0909123890",
    tier: "Bạc",
    orders: 6,
    spent: "8,5trđ",
    aov: "1.416.000đ",
    points: "850",
    lastOrder: "20/08/2026",
  },
  {
    id: "KH-15981",
    name: "Dương Ngọc Ánh",
    phone: "0988776655",
    tier: "Kim cương",
    orders: 41,
    spent: "88,2trđ",
    aov: "2.151.000đ",
    points: "8.820",
    lastOrder: "20/08/2026",
  },
  {
    id: "KH-15744",
    name: "Phan Văn Hậu",
    phone: "0934567891",
    tier: "Vàng",
    orders: 12,
    spent: "19,8trđ",
    aov: "1.650.000đ",
    points: "1.980",
    lastOrder: "19/08/2026",
  },
  {
    id: "KH-15420",
    name: "Trịnh Thúy Vy",
    phone: "0918765432",
    tier: "Đồng",
    orders: 4,
    spent: "4,6trđ",
    aov: "1.150.000đ",
    points: "460",
    lastOrder: "19/08/2026",
  },
  {
    id: "KH-15109",
    name: "Lý Hoàng Hải",
    phone: "0971239876",
    tier: "Bạc",
    orders: 7,
    spent: "10,5trđ",
    aov: "1.500.000đ",
    points: "1.050",
    lastOrder: "18/08/2026",
  },
  {
    id: "KH-14890",
    name: "Đặng Mỹ Duyên",
    phone: "0965891234",
    tier: "Vàng",
    orders: 16,
    spent: "26,1trđ",
    aov: "1.631.000đ",
    points: "2.610",
    lastOrder: "18/08/2026",
  },
  {
    id: "KH-14562",
    name: "Tạ Minh Khang",
    phone: "0943219876",
    tier: "Đồng",
    orders: 1,
    spent: "1,2trđ",
    aov: "1.200.000đ",
    points: "120",
    lastOrder: "17/08/2026",
  },
  {
    id: "KH-14210",
    name: "Cao Thùy Trang",
    phone: "0903344556",
    tier: "Kim cương",
    orders: 28,
    spent: "52,9trđ",
    aov: "1.889.000đ",
    points: "5.290",
    lastOrder: "16/08/2026",
  },
  {
    id: "KH-13905",
    name: "Huỳnh Tuấn Kiệt",
    phone: "0982334411",
    tier: "Bạc",
    orders: 10,
    spent: "14,3trđ",
    aov: "1.430.000đ",
    points: "1.430",
    lastOrder: "15/08/2026",
  },
  {
    id: "KH-13650",
    name: "Võ Quỳnh Chi",
    phone: "0916778899",
    tier: "Vàng",
    orders: 20,
    spent: "31,5trđ",
    aov: "1.575.000đ",
    points: "3.150",
    lastOrder: "15/08/2026",
  },
  {
    id: "KH-13320",
    name: "Lâm Đình Trọng",
    phone: "0978990011",
    tier: "Đồng",
    orders: 3,
    spent: "3,8trđ",
    aov: "1.266.000đ",
    points: "380",
    lastOrder: "14/08/2026",
  },
  {
    id: "KH-13008",
    name: "Mai Bảo Ngọc",
    phone: "0931223344",
    tier: "Kim cương",
    orders: 35,
    spent: "72,4trđ",
    aov: "2.068.000đ",
    points: "7.240",
    lastOrder: "13/08/2026",
  },
];

const columns: ColumnType<UserItem>[] = [
  {
    key: "stt",
    title: "STT",
    width: 70,
    align: "center",
    render: (_, _record, index) => <span className="font-mono text-zinc-600">{index + 1}</span>,
  },
  {
    key: "avatar",
    title: "AVATAR",
    dataIndex: "avatar",
    width: 80,
    align: "center",
    render: (val, record) => (
      <div className="flex items-center justify-center">
        {val ? (
          <img
            src={val}
            alt={record.full_name}
            className="w-8 h-8 rounded-none border border-black object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(record.full_name || "User");
            }}
          />
        ) : (
          <div className="w-8 h-8 bg-[#f2f1ee] border border-zinc-300 flex items-center justify-center font-mono font-bold text-xs text-zinc-700">
            {record.full_name ? record.full_name.trim().charAt(0).toUpperCase() : "U"}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "full_name",
    title: "HỌ TÊN",
    dataIndex: "full_name",
    width: 200,
    align: "left",
    render: (val) => <span className="font-bold text-zinc-950 font-sans">{val || "Chưa có tên"}</span>,
  },
  {
    key: "email",
    title: "EMAIL",
    dataIndex: "email",
    width: 200,
    align: "left",
    render: (val) => <span className="font-mono text-zinc-700">{val}</span>,
  },
  {
    key: "phone",
    title: "ĐIỆN THOẠI",
    dataIndex: "phone",
    width: 150,
    align: "left",
    render: (val) => <span className="font-mono text-zinc-600">{val || "—"}</span>,
  },
  {
    key: "role",
    title: "VAI TRÒ",
    dataIndex: "role",
    width: 120,
    align: "center",
    render: (val) => {
      const roleName = typeof val === "object" && val !== null ? val.name : (val || "user");
      return (
        <span className="font-mono uppercase text-[11px] font-bold px-2 py-0.5 border border-black bg-white text-black">
          {roleName}
        </span>
      );
    },
  },
  {
    key: "provider",
    title: "PHƯƠNG THỨC",
    dataIndex: "provider",
    width: 140,
    align: "center",
    render: (val) => {
      const provider = (val || "local").toLowerCase();
      const style =
        provider === "google"
          ? "border-red-400 text-red-700 bg-red-50"
          : provider === "facebook"
          ? "border-blue-400 text-blue-700 bg-blue-50"
          : "border-zinc-300 text-zinc-800 bg-zinc-50";
      return (
        <span className={`font-mono text-[11px] font-bold uppercase px-2.5 py-0.5 border ${style}`}>
          {provider}
        </span>
      );
    },
  },
  {
    key: "isOnline",
    title: "TRỰC TUYẾN",
    dataIndex: "isOnline",
    width: 130,
    align: "center",
    render: (isOnline) => (
      <div className="inline-flex items-center gap-1.5 font-mono text-xs">
        <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
        <span className={isOnline ? "text-emerald-700 font-semibold" : "text-zinc-500"}>
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
    ),
  },
  {
    key: "membership_tier",
    title: "HẠNG",
    dataIndex: "membership_tier",
    width: 140,
    align: "center",
    render: (val) => (
      <span className="font-sans uppercase text-xs font-semibold px-2.5 py-0.5 bg-zinc-100 text-zinc-900 border border-zinc-200">
        {val || "Newbie"}
      </span>
    ),
  },
  {
    key: "accumulated_points",
    title: "ĐIỂM TÍCH LŨY",
    dataIndex: "accumulated_points",
    width: 140,
    align: "center",
    render: (val) => <span className="font-mono text-zinc-900 font-bold">{(val ?? 0).toLocaleString()}</span>,
  },
  {
    key: "lastLogin",
    title: "LOGIN CUỐI",
    dataIndex: "lastLogin",
    width: 170,
    align: "center",
    render: (val) => (
      <span className="font-mono text-zinc-600 text-xs">
        {val
          ? new Date(val).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Chưa đăng nhập"}
      </span>
    ),
  },
  {
    key: "createdAt",
    title: "NGÀY TẠO",
    dataIndex: "createdAt",
    width: 150,
    align: "center",
    render: (val) => (
      <span className="font-mono text-zinc-600 text-xs">
        {val ? new Date(val).toLocaleDateString("vi-VN") : "—"}
      </span>
    ),
  },
  {
    key: "isOTPEmail",
    title: "XÁC THỰC EMAIL",
    dataIndex: "isOTPEmail",
    width: 150,
    align: "center",
    render: (val) => (
      <span
        className={`font-mono text-[11px] font-semibold px-2 py-0.5 border ${
          val
            ? "border-emerald-400 bg-emerald-50 text-emerald-700"
            : "border-amber-400 bg-amber-50 text-amber-700"
        }`}
      >
        {val ? "Đã xác thực" : "Chưa xác thực"}
      </span>
    ),
  },
  {
    key: "isActive",
    title: "VÔ HIỆU HÓA",
    dataIndex: "isActive",
    width: 140,
    align: "center",
    render: (isActive) => (
      <Switch
        checked={!isActive}
        size="small"
        className="[&.ant-switch-checked]:!bg-black"
      />
    ),
  },
  {
    key: "action",
    title: "THAO TÁC",
    width: 130,
    align: "center",
    fixed: "right",
    render: (_, _record) => (
      <div className="flex items-center justify-center gap-1.5">
        <button
          type="button"
          className="p-1.5 hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors cursor-pointer"
          title="Chỉnh sửa"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
          title="Xóa"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
  },
];

const CustomerPage = () => {
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data: listUsers, isLoading } = useGetAllUsers({
    page,
    sizePage: pageSize,
  });

  const userList = listUsers?.data?.users || (listUsers as any)?.users || [];
  const totalItems = listUsers?.data?.totalUser || (listUsers as any)?.totalUser || 0;
  return (
    <div className="space-y-4">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900 font-sans">
            KHÁCH HÀNG
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            18.402 khách · 4 hạng thành viên · 6 phân nhóm động
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            type="button"
            className="h-9 px-3.5 uppercase bg-white border border-[#c8c5be] text-xs font-semibold text-zinc-800 rounded-none hover:bg-zinc-50 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-600" />
            <span>xuất excel</span>
          </button>
          <button
            type="button"
            className="h-9 px-3.5 bg-white border border-[#c8c5be] text-xs font-semibold uppercase text-zinc-800 rounded-none hover:bg-zinc-50 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-600" />
            <span>gửi email chiến dịch</span>
          </button>
          <button
            type="button"
            className="h-9 px-3.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-none flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>tạo khách hành</span>
          </button>
        </div>
      </div>

      {/* 2. Thanh thẻ chỉ số thống kê */}
      <div className="flex flex-col sm:flex-row border border-black bg-white rounded-none  divide-y sm:divide-y-0 sm:divide-x divide-[#dedbd5]">
        <CardItem
          title="TỔNG KHÁCH HÀNG"
          number="18.402"
          description="+12% so với tháng trước"
        />
        <CardItem
          title="KHÁCH MỚI THÁNG NÀY"
          number="1.240"
          description="Đạt 103% chỉ tiêu"
        />
        <CardItem
          title="TỶ LỆ QUAY LẠI"
          number="42.8%"
          description="3.812 khách mua lại"
        />
        <CardItem
          title="GIÁ TRỊ VÒNG ĐỜI (CLV)"
          number="1.85M"
          description="Trung bình / khách"
        />
      </div>

      {/* 3. Thanh Bộ Lọc dùng Ant Design Form & Select có Placeholder và allowClear */}
      <div className="bg-white border border-black p-3.5 shadow-2xs font-mono">
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#000000",
              borderRadius: 0,
              controlHeight: 36,
              fontFamily: "inherit",
              fontSize: 12,
            },
            components: {
              Input: {
                hoverBorderColor: "#000000",
                activeBorderColor: "#000000",
                activeShadow: "none",
              },
              Select: {
                hoverBorderColor: "#000000",
                activeBorderColor: "#000000",
                activeOutlineColor: "transparent",
              },
              Button: {
                borderRadius: 0,
                controlHeight: 36,
              },
            },
          }}
        >
          <Form form={form} layout="inline" className="w-full flex flex-wrap items-center">
            {/* Ô tìm kiếm */}
            <Form.Item name="search" className="!mb-0 flex-1 min-w-[240px]">
              <Input
                prefix={<Search className="w-4 h-4 text-zinc-500 mr-1" />}
                placeholder="Tìm theo tên, SĐT, email, mã KH..."
                allowClear
              />
            </Form.Item>

            {/* Lọc Hạng thành viên */}
            <Form.Item name="tier" className="!mb-0">
              <Select
                placeholder="Hạng thành viên"
                allowClear
                className="min-w-[150px]"
                options={[
                  { value: "diamond", label: "KIM CƯƠNG" },
                  { value: "gold", label: "VÀNG" },
                  { value: "silver", label: "BẠC" },
                  { value: "new", label: "MỚI" },
                ]}
              />
            </Form.Item>

            {/* Lọc Phân nhóm */}
            <Form.Item name="segment" className="!mb-0">
              <Select
                placeholder="Phân nhóm khách"
                allowClear
                className="min-w-[160px]"
                options={[
                  { value: "vip", label: "TIỀM NĂNG (VIP)" },
                  { value: "loyal", label: "TRUNG THÀNH" },
                  { value: "risk", label: "NGUY CƠ RỜI BỎ" },
                  { value: "high_spending", label: "CHI TIÊU CAO" },
                ]}
              />
            </Form.Item>

            {/* Lọc Trạng thái */}
            <Form.Item name="status" className="!mb-0">
              <Select
                placeholder="Trạng thái"
                allowClear
                className="min-w-[140px]"
                options={[
                  { value: "active", label: "ĐANG HOẠT ĐỘNG" },
                  { value: "inactive", label: "TẠM KHÓA" },
                ]}
              />
            </Form.Item>

            {/* Sắp xếp */}
            <Form.Item name="sortBy" className="!mb-0">
              <Select
                placeholder="Sắp xếp theo"
                allowClear
                className="min-w-[160px]"
                options={[
                  { value: "newest", label: "MỚI NHẤT" },
                  { value: "spent_desc", label: "CHI TIÊU CAO NHẤT" },
                  { value: "orders_desc", label: "NHIỀU ĐƠN NHẤT" },
                  { value: "oldest", label: "CŨ NHẤT" },
                ]}
              />
            </Form.Item>

            {/* Nút Đặt lại */}
            <Form.Item className="!mb-0">
              <Button
                onClick={() => form.resetFields()}
                icon={<RotateCcw className="w-3.5 h-3.5 text-white" />}
                className="!bg-black hover:!bg-zinc-800 !text-white text-xs flex items-center font-mono cursor-pointer transition-colors"
              >
                ĐẶT LẠI
              </Button>
            </Form.Item>
          </Form>
        </ConfigProvider>
      </div>

      {/* 4. Table hiển thị danh sách khách hàng */}
      <div className="w-full bg-white rounded-none shadow-2xs">
        <Table<UserItem>
          columns={columns}
          dataSource={userList}
          rowKey="_id"
          loading={isLoading}
        />

        {/* 5. Phân trang */}
        <div className="border-t flex justify-end border-[#dedbd5]">
          <Pagination
            currentPage={page}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;
