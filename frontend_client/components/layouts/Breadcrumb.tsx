import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumb({ items = [] }: BreadcrumbProps) {
  // Loại bỏ item "Trang chủ" nếu được truyền ở đầu items để tránh trùng lặp
  const filteredItems = items.filter(
    (item, index) =>
      !(
        index === 0 &&
        (item.label.trim().toLowerCase() === "trang chủ" || item.href === "/")
      )
  );

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-secondary">
      <Link href="/" className="hover:text-primary transition-colors">
        Trang chủ
      </Link>

      {filteredItems.map((item, index) => {
        const isLast = index === filteredItems.length - 1;
        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-muted shrink-0" />
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
