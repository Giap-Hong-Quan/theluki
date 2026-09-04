import type { ColumnType } from "./Table";

interface TableRowSkeletonProps {
  columns: ColumnType<any>[];
}

export default function TableRowSkeleton({ columns }: TableRowSkeletonProps) {
  return (
    <tr className="animate-pulse border-b border-[#eceae4] bg-white">
      {columns.map((col) => {
        const fixedCellStyle =
          col.fixed === "right"
            ? "sticky right-0 z-10 bg-white border-l border-l-zinc-300 border-b border-b-[#e5e7eb]"
            : col.fixed === "left"
            ? "sticky left-0 z-10 bg-white border-r border-r-zinc-300 border-b border-b-[#e5e7eb]"
            : "border-b border-b-[#e5e7eb]";

        return (
          <td
            key={col.key}
            style={{ width: col.width, minWidth: col.width }}
            className={`px-3.5 py-3 whitespace-nowrap ${fixedCellStyle}`}
          >
            {col.key === "avatar" ? (
              <div className="w-9 h-9 bg-zinc-200 border border-zinc-300 mx-auto" />
            ) : col.key === "action" ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 bg-zinc-200 rounded-none" />
                <div className="w-6 h-6 bg-zinc-200 rounded-none" />
              </div>
            ) : col.key === "isActive" ? (
              <div className="w-8 h-4 bg-zinc-200 mx-auto rounded-full" />
            ) : col.align === "center" ? (
              <div className="h-4 bg-zinc-200 mx-auto w-16 rounded-none" />
            ) : col.align === "right" ? (
              <div className="h-4 bg-zinc-200 ml-auto w-20 rounded-none" />
            ) : (
              <div className="h-4 bg-zinc-200 w-3/4 max-w-[140px] rounded-none" />
            )}
          </td>
        );
      })}
    </tr>
  );
}
