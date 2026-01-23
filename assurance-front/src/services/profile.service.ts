import { api } from "../api/axios";
import type { User } from "../types/auth";

export const profileService = {
  async getProfile(): Promise<User> {
    // 🔗 PLACEHOLDER
    const { data } = await api.get<User>("/CLIENT_PROFILE_GET_URL");
    return data;
  },

  async updateProfile(payload: Partial<User>): Promise<User> {
    // 🔗 PLACEHOLDER
    const { data } = await api.put<User>("/CLIENT_PROFILE_UPDATE_URL", payload);
    return data;
  },
};
