import api from "./api";

export const authService = {
  login: async (data: { email?: string; username?: string; password?: string }) => {
    return api.post("/auth/login", data);
  },

  register: async (data: any) => {
    return api.post("/auth/register", data);
  },

  getProfile: async () => {
    return api.get("/auth/me");
  },
};
