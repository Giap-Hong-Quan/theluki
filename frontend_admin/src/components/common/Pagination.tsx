import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  // Thuật toán rút gọn số trang giống hệt bên client
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-1.5 select-none py-4 font-mono">
      {/* Nút Prev (<) */}
      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-9 h-9 flex items-center justify-center border border-[#dedbd5] rounded-none transition-colors ${
          currentPage === 1
            ? "text-zinc-300 border-zinc-200 cursor-not-allowed bg-white"
            : "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 bg-white cursor-pointer"
        }`}
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Danh sách các số trang */}
      {pageNumbers.map((p, index) => {
        if (p === "...") {
          return (
            <span
              key={`dots-${index}`}
              className="w-9 h-9 flex items-center justify-center text-sm font-medium text-zinc-400"
            >
              ...
            </span>
          );
        }

        const isCurrent = Number(p) === currentPage;

        return (
          <button
            key={`page-${p}`}
            type="button"
            onClick={() => handlePageChange(Number(p))}
            className={`w-9 h-9 flex items-center justify-center text-xs font-semibold rounded-none border transition-all cursor-pointer ${
              isCurrent
                ? "bg-zinc-900 border-zinc-900 text-white shadow-xs"
                : "bg-white border-[#dedbd5] text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100"
            }`}
          >
            {p}
          </button>
        );
      })}

      {/* Nút Next (>) */}
      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-9 h-9 flex items-center justify-center border border-[#dedbd5] rounded-none transition-colors ${
          currentPage === totalPages
            ? "text-zinc-300 border-zinc-200 cursor-not-allowed bg-white"
            : "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 bg-white cursor-pointer"
        }`}
        aria-label="Next Page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}