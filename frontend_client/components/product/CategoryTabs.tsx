"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, ConfigProvider, Skeleton } from "antd";
import { useCategories } from "@/hooks/useCategory";

export default function CategoryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const { data: categories = [], isLoading } = useCategories({
    isActive: true,
    isDeleted: false,
    sizePage: 0,
  });
  const handleSelectCategory = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "all") {
      params.delete("category");
    } else {
      params.set("category", key);
    }
    params.delete("page"); // Reset về trang 1 khi đổi danh mục
    const queryString = params.toString();
    router.push(`/product${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  // Danh sách các tab cho Antd Tabs
  const tabItems = [
    {
      key: "all",
      label: (
        <span className="uppercase text-xs sm:text-sm tracking-[0.18em]">
          Tất cả
        </span>
      ),
    },
    ...categories.map((cat) => ({
      key: cat.slug,
      label: (
        <span className="uppercase text-xs sm:text-sm tracking-[0.18em]">
          {cat.name}
        </span>
      ),
    })),
  ];

  return (
    <div className="w-full mt-5">
      {isLoading ? (
        <div className="flex items-center gap-4 py-3 border-b border-zinc-200">
          <Skeleton.Button active size="small" style={{ width: 80, borderRadius: 0 }} />
          <Skeleton.Button active size="small" style={{ width: 60, borderRadius: 0 }} />
          <Skeleton.Button active size="small" style={{ width: 100, borderRadius: 0 }} />
          <Skeleton.Button active size="small" style={{ width: 70, borderRadius: 0 }} />
          <Skeleton.Button active size="small" style={{ width: 90, borderRadius: 0 }} />
        </div>
      ) : (
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#18181b", // zinc-900 (màu đen cho active)
              colorText: "#a1a1aa", // zinc-400
              colorTextHeading: "#18181b",
              colorBorderSecondary: "#e4e4e7", // zinc-200
              borderRadius: 0,
            },
            components: {
              Tabs: {
                inkBarColor: "#18181b",
                itemSelectedColor: "#18181b",
                itemHoverColor: "#18181b",
                itemColor: "#a1a1aa",
                horizontalItemPadding: "12px 18px",
                horizontalMargin: "0",
              },
            },
          }}
        >
          <Tabs
            activeKey={activeCategory}
            onChange={handleSelectCategory}
            items={tabItems}
            className="[&_.ant-tabs-nav]:!mb-0 [&_.ant-tabs-nav::before]:!border-b [&_.ant-tabs-nav::before]:!border-zinc-200 [&_.ant-tabs-ink-bar]:!h-[2.5px] [&_.ant-tabs-ink-bar]:!bg-zinc-900 [&_.ant-tabs-tab-btn]:!font-semibold"
          />
        </ConfigProvider>
      )}
    </div>
  );
}
