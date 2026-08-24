import {
  TrendingUp,
  ShoppingBag,
  Users,
  Shirt,
  ArrowUpRight,
  Package,
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Tổng Doanh Thu",
      value: "128.500.000 ₫",
      change: "+18.2%",
      isPositive: true,
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    },
    {
      title: "Đơn Hàng Mới",
      value: "342",
      change: "+12.5%",
      isPositive: true,
      icon: <ShoppingBag className="w-5 h-5 text-blue-400" />,
    },
    {
      title: "Khách Hàng Mới",
      value: "1.250",
      change: "+8.1%",
      isPositive: true,
      icon: <Users className="w-5 h-5 text-purple-400" />,
    },
    {
      title: "Sản Phẩm Đang Bán",
      value: "86",
      change: "+4",
      isPositive: true,
      icon: <Shirt className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Bảng Điều Khiển Quản Trị
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Theo dõi tổng quan doanh số và hoạt động bán hàng của THE LUKI.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {stat.title}
              </span>
              <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700">
                {stat.icon}
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-white font-mono">
                {stat.value}
              </p>
              <span className="flex items-center text-xs font-semibold text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Overview */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-zinc-400" />
            <h2 className="text-base font-bold text-white">
              Đơn Hàng Gần Đây
            </h2>
          </div>
          <span className="text-xs text-zinc-400">Cập nhật theo thời gian thực</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs uppercase bg-zinc-800/60 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Số tiền</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {[
                {
                  id: "#ORD-9842",
                  customer: "Nguyễn Văn An",
                  amount: "750.000 ₫",
                  payment: "MoMo",
                  status: "Đã thanh toán",
                  statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                },
                {
                  id: "#ORD-9841",
                  customer: "Trần Thị Mai",
                  amount: "1.200.000 ₫",
                  payment: "VNPAY",
                  status: "Đã thanh toán",
                  statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                },
                {
                  id: "#ORD-9840",
                  customer: "Lê Hoàng Quân",
                  amount: "450.000 ₫",
                  payment: "COD",
                  status: "Chờ xử lý",
                  statusColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-white">
                    {row.id}
                  </td>
                  <td className="px-4 py-3.5 font-medium">{row.customer}</td>
                  <td className="px-4 py-3.5 font-mono font-semibold text-zinc-200">
                    {row.amount}
                  </td>
                  <td className="px-4 py-3.5">{row.payment}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${row.statusColor}`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
