export const CARD_PRODUCT = [
  {
    title: "tổng sản phẩm",
    number: (data?: any) => {
      return data?.totalProduct ?? 0;
    },
  },
  {
    title: "sản phẩm nổi bật",
    number: (data?: any) => {
      return data?.totalFeatured ?? 0;
    },
  },
  {
    title: "đang hoạt động",
    number: (data?: any) => {
      return data?.totalActive ?? 0;
    },
  },
  {
    title: "ngừng hoạt động",
    number: (data?: any) => {
      return data?.totalInactive ?? 0;
    },
  },
];

export const CARD_CATEGORY = [
  {
    title: "tổng danh mục",
    number: (data?: any) => {
      return data?.totalCategory ?? 0;
    },
  },
  {
    title: "đang hoạt động",
    number: (data?: any) => {
      return data?.totalActive ?? 0;
    },
  },
  {
    title: "ngừng hoạt động",
    number: (data?: any) => {
      return data?.totalInactive ?? 0;
    },
  },
];

export const CARD_COLLECTION = [
  {
    title: "tổng bộ sưu tập",
    number: (data?: any) => {
      return data?.totalCollection ?? 0;
    },
  },
  {
    title: "đang hoạt động",
    number: (data?: any) => {
      return data?.totalActive ?? 0;
    },
  },
  {
    title: "bộ sưu tập nổi bật",
    number: (data?: any) => {
      return data?.totalFeatured ?? 0;
    },
  },
  {
    title: "ngừng hoạt động",
    number: (data?: any) => {
      return data?.totalInactive ?? 0;
    },
  },
];
