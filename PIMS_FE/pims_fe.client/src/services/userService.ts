import api from "./api";
import type { ApiResponse, UserInfo, ChangePasswordRequest } from "../types";
import type { PagedResult } from "../types/user.types";

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

  changePassword: async (
    data: ChangePasswordRequest,
  ): Promise<ApiResponse<UserInfo>> => {
    const response = await api.post<ApiResponse<UserInfo>>(
      "/api/user/me/change-password",
      data,
    );
    return response.data;
  },

  getUsers: async (
    pageIndex: number,
    pageSize: number,
    search: string,
    role?: string,
    status?: string,
  ): Promise<ApiResponse<PagedResult<UserInfo>>> => {
    const params = new URLSearchParams();
    params.set("pageIndex", String(pageIndex));
    params.set("pageSize", String(pageSize));
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    if (status) params.set("status", status);

    const response = await api.get<ApiResponse<PagedResult<UserInfo>>>(
      `/api/user?${params.toString()}`,
    );
    return response.data;
  },
};

export default userService;
