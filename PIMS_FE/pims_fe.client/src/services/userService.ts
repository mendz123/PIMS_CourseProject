import api from "./api";
import type { ApiResponse, UserInfo } from "../types";

export const userService = {
  updateProfile: async (data: FormData): Promise<ApiResponse<UserInfo>> => {
    const response = await api.put<ApiResponse<UserInfo>>(
      "/api/user/me",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
};

export default userService;
