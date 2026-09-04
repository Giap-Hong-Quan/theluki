import { useMemo, useState } from "react";
import { Form, Input, Select, Button, ConfigProvider, Switch, DatePicker } from "antd";
import { Download, Mail, Plus, Search, RotateCcw, Pencil, Trash2 } from "lucide-react";
import CardItem from "../../components/common/CardItem";
import Table, { type ColumnType } from "../../components/common/Table";
import Pagination from "../../components/common/Pagination";
import { useDeleteUser, useGetAllUsers } from "../../hook/useUser";
import type { GetUsersQueryParams, UserItem } from "../../types/userType";
import { MEMBERSHIP_TIER_OPTIONS } from "../../constants/navigation";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import CreateEditCustomer from "../../components/user/modal/CreateEditCustomer";
import TrashModal from "../../components/common/TrashModal";

interface CustomerFilterFormValues {
  search?: string;
  tier?: string;
  isActive?: boolean;
  isOnline?: boolean;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
}

const MOCK_TIER_DISTRIBUTION = [
  { label: "Đồng — dưới 5tr", count: "12.842", percentage: 70 },
  { label: "Bạc — 5 đến 15tr", count: "3.984", percentage: 22 },
  { label: "Vàng — 15 đến 40tr", count: "1.164", percentage: 6 },
  { label: "Kim cương — trên 40tr", count: "412", percentage: 2 },
];

const MOCK_LOYALTY_PROGRAM = [
  { label: "Tỷ lệ tích điểm", value: "1% giá trị đơn" },
  { label: "Giá trị quy đổi", value: "1 điểm = 1.000đ" },
  { label: "Tối đa dùng mỗi đơn", value: "30% giá trị" },
  { label: "Hạn dùng điểm", value: "12 tháng" },
  { label: "Ưu đãi sinh nhật", value: "Voucher 150.000đ" },
];

const CustomerPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openTrash, setOpenTrash] = useState(false);
  const [title,setTitle] =useState('s')
  const [form] = Form.useForm();
  const [filter, setFilter] = useState<GetUsersQueryParams>({
    page: 1,
    sizePage: 20,
    isActive: true,
  });
  const {mutate:deleteUser} = useDeleteUser();
  const handleDeleteUser=(id:string)=>{
    deleteUser(id);
  }
  const handleEditUser=(id:string)=>{
    setOpenModal(true);
    setTitle('Cập nhật khách hàng');
  }
  const handleCreateUser =()=>{
    setOpenModal(true);
    setTitle('Thêm mới khách hàng');
  }
  const { data: listUsers, isLoading } = useGetAllUsers(filter);
  const userList = listUsers?.users || [];
  const totalItems = listUsers?.totalUser || 0;

  const OnFilter = (values: CustomerFilterFormValues) => {
    const { dateRange, ...rest } = values;
    let fromDate: string | undefined;
    let toDate: string | undefined;
    if (Array.isArray(dateRange) && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      fromDate = dayjs(dateRange[0]).format("DD/MM/YYYY");
      toDate = dayjs(dateRange[1]).format("DD/MM/YYYY");
    }
    setFilter((pre) => {
      return {
        ...pre,
        ...rest,
        fromDate,
        toDate
      };
    });
  };

  const handleDebouncedFilter = useMemo(() =>
    debounce((values: CustomerFilterFormValues) => {
      OnFilter(values);
    }, 1000),
    []
  );
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
    render: (val) => {
      const tier = MEMBERSHIP_TIER_OPTIONS.find((t) => t.value === val);
      return (
        <span className="font-sans uppercase text-xs font-semibold px-2.5 py-0.5 bg-zinc-100 text-zinc-900 border border-zinc-200">
          {tier?.label || val || "MỚI"}
        </span>
      );
    },
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
        className={`font-mono text-[11px] font-semibold px-2 py-0.5 border ${val
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
    title: "TRẠNG THÁI",
    dataIndex: "isActive",
    width: 140,
    align: "center",
    render: (isActive) => (
      <Switch
        checked={isActive}
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
    render: (_, record) => (
      <div className="flex items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => handleEditUser(record._id)}
          className="p-1.5 hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors cursor-pointer"
          title="Chỉnh sửa"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleDeleteUser(record._id)}
          className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
          title="Xóa"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
  },
];

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
            onClick={() => setOpenTrash(true)}
            className="h-9 px-3.5 uppercase bg-white border border-[#c8c5be] text-xs font-semibold text-zinc-800 rounded-none hover:bg-zinc-50 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-600" />
            <span>thùng rác</span>
          </button>
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
            onClick={handleCreateUser}
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
          number="3000"
          description="+12% so với tháng trước"
        />
        <CardItem
          title="KHÁCH MỚI THÁNG NÀY"
          number="70"
          description="Đạt 103% chỉ tiêu"
        />
        <CardItem
          title="ĐANG ONLINE"
          number="600"
          description="3.812 khách mua lại"
        />
        <CardItem
          title="BỊ KHÓA"
          number="300"
          description=" Trung bình / khách"
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
              DatePicker: {
                hoverBorderColor: "#000000",
                activeBorderColor: "#000000",
                activeShadow: "none",
                cellActiveWithRangeBg: "#f4f4f5",
                cellHoverWithRangeBg: "#e4e4e7",
                cellRangeBorderColor: "transparent",
              },
              Button: {
                borderRadius: 0,
                controlHeight: 36,
              },
            },
          }}
        >
          <Form
            form={form}
            initialValues={{ isActive: true }}
            onValuesChange={(changedValues, allValues) => {
              handleDebouncedFilter(allValues);
            }}
            layout="inline" className="w-full flex flex-wrap items-center">
            <Form.Item name="search" className="!mb-0 flex-1 min-w-[220px]">
              <Input
                prefix={<Search className="w-4 h-4 text-zinc-500 mr-1" />}
                placeholder="Tìm theo tên, SĐT, email, mã KH..."
                allowClear
              />
            </Form.Item>
            <Form.Item name="tier" className="!mb-0">
              <Select
                placeholder="Hạng thành viên"
                allowClear
                className="min-w-[160px]"
                options={MEMBERSHIP_TIER_OPTIONS}
              />
            </Form.Item>
            <Form.Item name="isActive" className="!mb-0">
              <Select
                placeholder="Trạng thái"
                allowClear
                className="min-w-[140px]"
                options={[
                  { value: true, label: "ĐANG HOẠT ĐỘNG" },
                  { value: false, label: "TẠM KHÓA" },
                ]}
              />
            </Form.Item>
            {/* Lọc Trực tuyến: Online / Offline */}
            <Form.Item name="isOnline" className="!mb-0">
              <Select
                placeholder="Trực tuyến"
                allowClear
                className="min-w-[130px]"
                options={[
                  { value: true, label: "ONLINE" },
                  { value: false, label: "OFFLINE" },
                ]}
              />
            </Form.Item>
            {/* Lọc Từ ngày đến ngày */}
            <Form.Item name="dateRange" className="!mb-0">
              <DatePicker.RangePicker
                placeholder={["Từ ngày", "Đến ngày"]}
                format="DD/MM/YYYY"
                className="min-w-[240px]"
              />
            </Form.Item>
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
      <div className="w-full bg-white rounded-none shadow-2xs">
        <Table<UserItem>
          columns={columns}
          dataSource={userList}
          rowKey="_id"
          loading={isLoading}
          skeletonRows={filter.sizePage}
        />
        <div className="border-t flex justify-end border-[#dedbd5]">
          <Pagination
            currentPage={filter.page ?? 1}
            totalItems={totalItems}
            pageSize={filter.sizePage ?? 20}
            onPageChange={(p) => setFilter((prev) => ({ ...prev, page: p }))}
          />
        </div>
      </div>

      {/* 2 CARD THỐNG KÊ BÊN DƯỚI DANH SÁCH KHÁCH HÀNG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Phân bổ theo hạng */}
        <div className="bg-white border border-[#c8c5be] p-5 shadow-2xs rounded-none">
          <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-900 font-sans border-b border-[#e5e3df] pb-3 mb-4">
            PHÂN BỔ THEO HẠNG
          </h2>
          <div className="space-y-4">
            {MOCK_TIER_DISTRIBUTION.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-700 font-medium font-sans">
                    {item.label}
                  </span>
                  <span className="font-mono text-zinc-900 font-semibold">
                    {item.count} · {item.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#eae7e1] overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Chương trình khách thân thiết */}
        <div className="bg-white border border-[#c8c5be] p-5 shadow-2xs rounded-none flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-900 font-sans border-b border-[#e5e3df] pb-3 mb-2">
              CHƯƠNG TRÌNH KHÁCH THÂN THIẾT
            </h2>
            <div className="divide-y divide-[#ece9e4]">
              {MOCK_LOYALTY_PROGRAM.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2.5 text-xs"
                >
                  <span className="text-zinc-700 font-sans">
                    {item.label}
                  </span>
                  <span className="font-mono font-bold text-zinc-950">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <CreateEditCustomer
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={title||'Thêm khách hàng'}
        // onSubmit={onSubmit}
        // initialValues={initialValues}
        // title={title}
      />
      <TrashModal
        open={openTrash}
        onClose={() => setOpenTrash(false)}
        entityName="khách hàng"
      />
    </div>
  );
};

export default CustomerPage;
