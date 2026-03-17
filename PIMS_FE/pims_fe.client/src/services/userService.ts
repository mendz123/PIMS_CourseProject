import api from "./api";
import type { ApiResponse, UserInfo, ChangePasswordRequest } from "../types";
import type { PagedResult, LecturerSummaryDto } from "../types/user.types";

export interface UserSuggestion {
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}


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

  getUserById: async (id: number): Promise<ApiResponse<UserInfo>> => {
    const response = await api.get<ApiResponse<UserInfo>>(`/api/user/${id}`);
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

  patchUser: async (
    id: number,
    data: Partial<{
      fullName: string;
      phoneNumber: string;
      roleName: string;
      statusName: string;
    }>,
  ): Promise<ApiResponse<UserInfo>> => {
    const response = await api.patch<ApiResponse<UserInfo>>(
      `/api/user/${id}`,
      data,
    );
    return response.data;
  },

  getLecturersSummary: async (
    semesterId?: number,
  ): Promise<ApiResponse<LecturerSummaryDto[]>> => {
    const params = semesterId ? `?semesterId=${semesterId}` : "";
    const response = await api.get<ApiResponse<LecturerSummaryDto[]>>(
      `/api/user/lecturers/summary${params}`,
    );
    return response.data;
  },

  searchStudents: async (query: string): Promise<UserSuggestion[]> => {
    if (!query.trim()) return [];
    const response = await api.get<ApiResponse<UserSuggestion[]>>(
      "/api/user/suggest",
      { params: { q: query, role: "STUDENT" } },
    );
    return response.data.data ?? [];
  },

  searchTeachers: async (query: string): Promise<UserSuggestion[]> => {
    if (!query.trim()) return [];
    const response = await api.get<ApiResponse<UserSuggestion[]>>(
      "/api/user/suggest",
      { params: { q: query, role: "TEACHER" } },
    );
    return response.data.data ?? [];
  },

  importStudents: async (file: File): Promise<ApiResponse<UserInfo[]>> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<ApiResponse<UserInfo[]>>(
      "/api/user/import-students",
      formData,
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
