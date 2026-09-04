import { Loader2, Inbox } from "lucide-react";
import TableRowSkeleton from "./TableRowSkeleton";

export interface ColumnType<T> {
  key: string;
  title: React.ReactNode;
  dataIndex?: keyof T;
  align?: "left" | "center" | "right";
  width?: string | number;
  fixed?: "left" | "right";
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface TableProps<T> {
  columns: ColumnType<T>[];
  dataSource?: T[];
  rowKey?: keyof T | ((record: T) => string);
  loading?: boolean;
  skeletonRows?: number;
  emptyText?: string;
  className?: string;
  onRowClick?: (record: T, index: number) => void;
}

export default function Table<T extends Record<string, any>>({
  columns,
  dataSource = [],
  rowKey = "id",
  loading = false,
  skeletonRows,
  emptyText = "Không có dữ liệu",
  className = "",
  onRowClick,
}: TableProps<T>) {
  // Lấy key duy nhất cho mỗi dòng
  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === "function") return rowKey(record);
    return record[rowKey] ?? index;
  };

  return (
    <div
      className={`w-full overflow-x-auto max-h-[550px] overflow-y-auto bg-white border border-black select-none ${className}`}
    >
      <table className="min-w-full text-left border-separate border-spacing-0 font-sans">
        {/* 1. Header Bảng */}
        <thead className="text-black font-mono text-lg uppercase tracking-wider">
          <tr>
            {columns.map((col) => {
              const fixedHeaderStyle =
                col.fixed === "right"
                  ? "sticky right-0 z-20 shadow-[-2px_0_4px_rgba(0,0,0,0.06)] border-l border-l-zinc-300 border-b border-b-black"
                  : col.fixed === "left"
                  ? "sticky left-0 z-20 shadow-[2px_0_4px_rgba(0,0,0,0.06)] border-r border-r-zinc-300 border-b border-b-black"
                  : "z-10 border-b border-b-black";

              return (
                <th
                  key={col.key}
                  style={{ width: col.width, minWidth: col.width }}
                  className={`sticky top-0 bg-[#f2f1ee] whitespace-nowrap px-3.5 py-2 font-semibold ${fixedHeaderStyle} ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {col.title}
                </th>
              );
            })}
          </tr>
        </thead>

        {/* 2. Thân Bảng */}
        <tbody className="divide-y divide-[#eceae4] text-zinc-900 text-lg">
          {loading ? (
            skeletonRows ? (
              Array.from({ length: skeletonRows }).map((_, idx) => (
                <TableRowSkeleton key={idx} columns={columns} />
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-14 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-900" />
                    <span className="font-mono text-xs">Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            )
          ) : dataSource.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-14 text-center text-zinc-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Inbox className="w-8 h-8 stroke-1 text-zinc-300" />
                  <span className="font-mono text-xs">{emptyText}</span>
                </div>
              </td>
            </tr>
          ) : (
            dataSource.map((record, index) => {
              const key = getRowKey(record, index);
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(record, index)}
                  className={`hover:bg-[#faf9f6] transition-colors duration-100 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((col) => {
                    const value = col.dataIndex ? record[col.dataIndex] : undefined;
                    const fixedCellStyle =
                      col.fixed === "right"
                        ? "sticky right-0 z-10 bg-white shadow-[-2px_0_4px_rgba(0,0,0,0.06)] border-l border-l-zinc-300 border-b border-b-[#e5e7eb]"
                        : col.fixed === "left"
                        ? "sticky left-0 z-10 bg-white shadow-[2px_0_4px_rgba(0,0,0,0.06)] border-r border-r-zinc-300 border-b border-b-[#e5e7eb]"
                        : "border-b border-b-[#e5e7eb]";

                    return (
                      <td
                        key={col.key}
                        style={{ width: col.width, minWidth: col.width }}
                        className={`px-3.5 py-3.5 whitespace-nowrap ${fixedCellStyle} ${
                          col.align === "center"
                            ? "text-center"
                            : col.align === "right"
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {col.render
                          ? col.render(value, record, index)
                          : String(value ?? "-")}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}