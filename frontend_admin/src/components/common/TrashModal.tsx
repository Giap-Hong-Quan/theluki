import React, { useState, useMemo } from "react";
import { Modal } from "antd";
import {
  Trash2,
  RotateCcw,
  Search,
  AlertTriangle,
  X,
  CheckSquare,
  Square,
  Clock,
  ArrowUpDown,
  Inbox,
  ShieldAlert,
} from "lucide-react";

export interface TrashItem {
  id: string;
  name: string;
  subtitle?: string; // Email, SKU, Mã đơn, v.v.
  code?: string; // Số điện thoại, Mã định danh
  avatar?: string;
  deletedAt: string; // Ngày xóa
  daysRemaining?: number; // Số ngày còn lại trước khi xóa vĩnh viễn
  originalData?: any;
}

export interface TrashModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  entityName?: string; // Ví dụ: "khách hàng", "sản phẩm", "bài viết"
  items?: TrashItem[];
  onRestore?: (item: TrashItem) => void;
  onPermanentDelete?: (item: TrashItem) => void;
  onBatchRestore?: (selectedIds: string[]) => void;
  onBatchPermanentDelete?: (selectedIds: string[]) => void;
  onEmptyTrash?: () => void;
}

// DỮ LIỆU CỨNG MẪU (DÙNG ĐỂ PREVIEW & TEST TẠI MỌI TRANG)
const MOCK_TRASH_ITEMS: TrashItem[] = [
  {
    id: "TRASH-001",
    name: "Nguyễn Hoàng Long",
    subtitle: "long.nguyen@example.com",
    code: "0912 345 678",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=NguyenHoangLong",
    deletedAt: "02/09/2026 14:32",
    daysRemaining: 27,
  },
  {
    id: "TRASH-002",
    name: "Trần Mai Phương",
    subtitle: "phuong.tran@gmail.com",
    code: "0988 765 432",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TranMaiPhuong",
    deletedAt: "28/08/2026 09:15",
    daysRemaining: 22,
  },
  {
    id: "TRASH-003",
    name: "Lê Minh Tuấn",
    subtitle: "tuan.leminh@outlook.com",
    code: "0905 123 987",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=LeMinhTuan",
    deletedAt: "20/08/2026 18:45",
    daysRemaining: 14,
  },
  {
    id: "TRASH-004",
    name: "Phạm Hải Đăng",
    subtitle: "dang.pham@company.vn",
    code: "0934 888 999",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=PhamHaiDang",
    deletedAt: "10/08/2026 11:20",
    daysRemaining: 4,
  },
  {
    id: "TRASH-005",
    name: "Đỗ Bích Ngọc",
    subtitle: "bichngoc.do@gmail.com",
    code: "0977 456 123",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DoBichNgoc",
    deletedAt: "08/08/2026 16:05",
    daysRemaining: 2,
  },
];

const TrashModal: React.FC<TrashModalProps> = ({
  open,
  onClose,
  title,
  entityName = "mục",
  items = MOCK_TRASH_ITEMS,
  onRestore,
  onPermanentDelete,
  onBatchRestore,
  onBatchPermanentDelete,
  onEmptyTrash,
}) => {
  const [dataList, setDataList] = useState<TrashItem[]>(items);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const pageSize = 5;

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredItems = useMemo(() => {
    if (!searchKeyword.trim()) return dataList;
    const kw = searchKeyword.toLowerCase();
    return dataList.filter(
      (item) =>
        item.name.toLowerCase().includes(kw) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(kw)) ||
        (item.code && item.code.toLowerCase().includes(kw))
    );
  }, [dataList, searchKeyword]);

  // Phân trang
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;

  // Xử lý chọn checkbox
  const isAllSelected =
    paginatedItems.length > 0 &&
    paginatedItems.every((item) => selectedIds.includes(item.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedItems.some((item) => item.id === id))
      );
    } else {
      const currentIds = paginatedItems.map((item) => item.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Khôi phục 1 mục
  const handleSingleRestore = (item: TrashItem) => {
    if (onRestore) {
      onRestore(item);
    } else {
      setDataList((prev) => prev.filter((i) => i.id !== item.id));
      setSelectedIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  // Xóa vĩnh viễn 1 mục
  const handleSinglePermanentDelete = (item: TrashItem) => {
    if (onPermanentDelete) {
      onPermanentDelete(item);
    } else {
      setDataList((prev) => prev.filter((i) => i.id !== item.id));
      setSelectedIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  // Khôi phục các mục đã chọn
  const handleRestoreSelected = () => {
    if (onBatchRestore) {
      onBatchRestore(selectedIds);
    } else {
      setDataList((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
      setSelectedIds([]);
    }
  };

  // Xóa vĩnh viễn các mục đã chọn
  const handleDeleteSelected = () => {
    if (onBatchPermanentDelete) {
      onBatchPermanentDelete(selectedIds);
    } else {
      setDataList((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
      setSelectedIds([]);
    }
  };

  // Dọn sạch toàn bộ thùng rác
  const handleEmptyTrash = () => {
    if (onEmptyTrash) {
      onEmptyTrash();
    } else {
      setDataList([]);
      setSelectedIds([]);
    }
  };

  const displayTitle =
    title || `THÙNG RÁC - ${entityName.toUpperCase()}`;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={980}
      centered
      closable={false}
      footer={null}
      className="[&_.ant-modal-content]:rounded-none [&_.ant-modal-content]:p-0 [&_.ant-modal-content]:border [&_.ant-modal-content]:border-black [&_.ant-modal-content]:shadow-2xl overflow-hidden font-sans"
    >
      {/* 1. MODAL HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#faf9f8] border-b border-[#e5e3df]">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 bg-black inline-block shrink-0" />
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-zinc-900" />
            <h1 className="text-base font-black uppercase tracking-tight text-zinc-900">
              {displayTitle}
            </h1>
          </div>
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-zinc-200 text-zinc-800 uppercase">
            {dataList.length} ĐÃ XÓA
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-200 transition-colors cursor-pointer"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. ALERT BANNER */}
      <div className="px-6 py-2.5 bg-[#fbf5eb] border-b border-[#e7dbce] flex items-center justify-between text-xs text-amber-900 font-mono">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>
            Các mục trong thùng rác sẽ được tự động dọn sạch sau <strong>30 ngày</strong> kể từ ngày xóa.
          </span>
        </div>
        {dataList.length > 0 && (
          <button
            type="button"
            onClick={handleEmptyTrash}
            className="text-[11px] font-bold uppercase underline hover:text-red-700 cursor-pointer transition-colors"
          >
            Dọn sạch tất cả
          </button>
        )}
      </div>

      {/* 3. TOOLBAR (SEARCH + ACTIONS) */}
      <div className="px-6 py-3 bg-white border-b border-[#e5e3df] flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setPage(1);
            }}
            placeholder={`Tìm kiếm ${entityName}...`}
            className="w-full h-8 pl-9 pr-3 bg-white border border-[#c8c5be] text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end font-mono">
          {selectedIds.length > 0 ? (
            <>
              <span className="text-xs text-zinc-600 font-semibold mr-1">
                Đã chọn: <strong>{selectedIds.length}</strong>
              </span>
              <button
                type="button"
                onClick={handleRestoreSelected}
                className="h-8 px-3 bg-white hover:bg-zinc-100 text-zinc-900 border border-[#c8c5be] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>KHÔI PHỤC ({selectedIds.length})</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>XÓA HẲN ({selectedIds.length})</span>
              </button>
            </>
          ) : (
            <span className="text-[11px] text-zinc-500 font-mono">
              Chọn các dòng để thao tác hàng loạt
            </span>
          )}
        </div>
      </div>

      {/* 4. DATA TABLE */}
      <div className="max-h-[380px] overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#faf9f8] border-b border-[#e5e3df] sticky top-0 z-10 font-mono text-[11px] text-zinc-700 uppercase tracking-wider">
            <tr>
              <th className="w-12 px-4 py-2.5 text-center">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="cursor-pointer text-zinc-600 hover:text-black flex items-center justify-center mx-auto"
                  title="Chọn tất cả trang này"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-black" />
                  ) : (
                    <Square className="w-4 h-4 text-zinc-400" />
                  )}
                </button>
              </th>
              <th className="px-4 py-2.5">MỤC ĐÃ XÓA</th>
              <th className="px-4 py-2.5 w-40">MÃ / LIÊN HỆ</th>
              <th className="px-4 py-2.5 w-44">NGÀY XÓA</th>
              <th className="px-4 py-2.5 w-32 text-center">CÒN LẠI</th>
              <th className="px-4 py-2.5 w-32 text-center">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece9e4] text-xs">
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isUrgent = (item.daysRemaining ?? 30) <= 5;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-zinc-50/80 transition-colors ${
                      isSelected ? "bg-zinc-100/70" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectItem(item.id)}
                        className="cursor-pointer text-zinc-600 hover:text-black flex items-center justify-center mx-auto"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-black" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-400" />
                        )}
                      </button>
                    </td>

                    {/* Tên & Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-8 h-8 rounded-none border border-zinc-300 object-cover shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://api.dicebear.com/7.x/initials/svg?seed=" +
                                encodeURIComponent(item.name);
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 border border-zinc-300 bg-zinc-100 flex items-center justify-center font-mono font-bold text-zinc-600 shrink-0 text-xs">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-zinc-950 font-sans line-clamp-1">
                            {item.name}
                          </div>
                          {item.subtitle && (
                            <div className="text-[11px] text-zinc-500 font-mono line-clamp-1">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Mã định danh / Liên hệ */}
                    <td className="px-4 py-3 font-mono text-zinc-700 text-xs">
                      {item.code || "—"}
                    </td>

                    {/* Ngày xóa */}
                    <td className="px-4 py-3 font-mono text-zinc-600 text-xs">
                      {item.deletedAt}
                    </td>

                    {/* Số ngày còn lại */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 border ${
                          isUrgent
                            ? "bg-red-50 text-red-700 border-red-300"
                            : "bg-zinc-100 text-zinc-700 border-zinc-300"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{item.daysRemaining ?? 30} ngày</span>
                      </span>
                    </td>

                    {/* Thao tác từng dòng */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSingleRestore(item)}
                          className="p-1.5 hover:bg-emerald-50 text-zinc-600 hover:text-emerald-700 transition-colors cursor-pointer border border-transparent hover:border-emerald-300"
                          title="Khôi phục mục này"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSinglePermanentDelete(item)}
                          className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer border border-transparent hover:border-red-300"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-zinc-400">
                    <Inbox className="w-10 h-10 stroke-[1.2] mb-2" />
                    <p className="font-mono text-xs uppercase font-semibold text-zinc-600">
                      Thùng rác trống
                    </p>
                    <p className="font-mono text-[11px] text-zinc-400 mt-0.5">
                      Không có mục nào đang chờ khôi phục hoặc xóa.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. FOOTER & PAGINATION */}
      <div className="px-6 py-3.5 bg-[#faf9f8] border-t border-[#e5e3df] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="font-mono text-xs text-zinc-500">
          Hiển thị <strong>{paginatedItems.length}</strong> / <strong>{filteredItems.length}</strong> mục
        </div>

        <div className="flex items-center gap-2">
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 font-mono text-xs mr-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-2.5 py-1 bg-white border border-[#c8c5be] hover:bg-zinc-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                Trước
              </button>
              <span className="px-2 font-bold text-zinc-800">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 bg-white border border-[#c8c5be] hover:bg-zinc-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                Sau
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider cursor-pointer font-mono transition-colors"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TrashModal;
