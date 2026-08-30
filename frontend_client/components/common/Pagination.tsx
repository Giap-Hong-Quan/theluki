"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    if (onPageChange) {
      onPageChange(page);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", page.toString());
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
    }
  };

  // Tính toán danh sách các trang cần hiển thị kèm dấu ...
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
    <div className="flex items-center justify-center space-x-1.5 select-none py-10">
      {/* Nút Prev (<) */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-9 h-9 flex items-center justify-center rounded-none transition-colors ${
          currentPage === 1
            ? "text-neutral-300 cursor-not-allowed"
            : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 cursor-pointer"
        }`}
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Danh sách các số trang - Vuông vức (rounded-none) */}
      {pageNumbers.map((p, index) => {
        if (p === "...") {
          return (
            <span
              key={`dots-${index}`}
              className="w-9 h-9 flex items-center justify-center text-sm font-medium text-neutral-400"
            >
              ...
            </span>
          );
        }

        const isCurrent = p === currentPage;

        return (
          <button
            key={`page-${p}`}
            onClick={() => handlePageChange(Number(p))}
            className={`w-9 h-9 flex items-center justify-center text-sm font-semibold rounded-none transition-all ${
              isCurrent
                ? "bg-neutral-900 text-white shadow-sm"
                : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 cursor-pointer"
            }`}
          >
            {p}
          </button>
        );
      })}

      {/* Nút Next (>) */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-9 h-9 flex items-center justify-center rounded-none transition-colors ${
          currentPage === totalPages
            ? "text-neutral-300 cursor-not-allowed"
            : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 cursor-pointer"
        }`}
        aria-label="Next Page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
