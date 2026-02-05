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
  ): Promise<ApiResponse<PagedResult<UserInfo>>> => {
    const response = await api.get<ApiResponse<PagedResult<UserInfo>>>(
      `/api/user?pageIndex=${pageIndex}&pageSize=${pageSize}&search=${search}`,
    );
    return response.data;
  },
};

export default userService;
