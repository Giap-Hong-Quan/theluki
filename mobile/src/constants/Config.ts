import { Platform } from "react-native";

/**
 * Lưu ý cấu hình URL kết nối tới Backend (chạy port 8000):
 * - Android Emulator (máy ảo Android): dùng http://10.0.2.2:8000/api
 * - iOS Simulator (máy ảo iOS): dùng http://localhost:8000/api
 * - Điện thoại thật (Expo Go qua WiFi): thay bằng IP mạng LAN của máy tính (ví dụ: http://192.168.1.15:8000/api)
 */
const DEV_API_URL = Platform.select({
  android: "http://10.0.2.2:8000/api",
  ios: "http://localhost:8000/api",
  default: "http://localhost:8000/api",
});

export const CONFIG = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || DEV_API_URL,
  TIMEOUT: 15000,
};
