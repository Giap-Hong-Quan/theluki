export interface ViettelProvince {
  PROVINCE_ID: number;
  PROVINCE_CODE: string;
  PROVINCE_NAME: string;
}

export interface ViettelDistrict {
  DISTRICT_ID: number;
  DISTRICT_VALUE: string;
  DISTRICT_NAME: string;
  PROVINCE_ID: number;
}

export interface ViettelWard {
  WARDS_ID: number;
  WARDS_NAME: string;
  DISTRICT_ID: number;
}

const VIETTELPOST_API_BASE = "https://partnerdev.viettelpost.vn/v2/categories";

export const viettelPostLocationService = {
  // 1. Lấy danh sách Tỉnh / Thành phố
  getProvinces: async (): Promise<ViettelProvince[]> => {
    try {
      const res = await fetch(`${VIETTELPOST_API_BASE}/listProvince`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json?.data || [];
    } catch (error) {
      console.error("Lỗi lấy danh sách Tỉnh/Thành từ ViettelPost:", error);
      return [];
    }
  },

  // 2. Lấy danh sách Quận / Huyện theo provinceId
  getDistricts: async (provinceId: number | string): Promise<ViettelDistrict[]> => {
    if (!provinceId) return [];
    try {
      const res = await fetch(`${VIETTELPOST_API_BASE}/listDistrict?provinceId=${provinceId}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json?.data || [];
    } catch (error) {
      console.error("Lỗi lấy danh sách Quận/Huyện từ ViettelPost:", error);
      return [];
    }
  },

  // 3. Lấy danh sách Phường / Xã theo districtId
  getWards: async (districtId: number | string): Promise<ViettelWard[]> => {
    if (!districtId) return [];
    try {
      const res = await fetch(`${VIETTELPOST_API_BASE}/listWards?districtId=${districtId}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json?.data || [];
    } catch (error) {
      console.error("Lỗi lấy danh sách Phường/Xã từ ViettelPost:", error);
      return [];
    }
  },
};

export default viettelPostLocationService;
