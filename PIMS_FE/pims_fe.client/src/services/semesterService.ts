import api from "./api";
import type { ApiResponse } from "../types/assessment.types";

export interface SemesterDto {
  semesterId: number;
  semesterName: string | null;
  startDate: string | null;
  endDate: string | null;
  minGroupSize: number | null;
  maxGroupSize: number | null;
  isActive: boolean | null;
}

export interface CreateSemesterDto {
  semesterName: string;
  startDate: string;
  endDate: string;
  minGroupSize: number;
  maxGroupSize: number;
  isActive: boolean;
}

export interface UpdateSemesterDto {
  semesterName?: string;
  startDate?: string;
  endDate?: string;
  minGroupSize?: number;
  maxGroupSize?: number;
  isActive?: boolean;
}

export const semesterService = {
  // Get all semesters
  getAllSemesters: async () => {
    const response = await api.get<ApiResponse<SemesterDto[]>>("/api/semester");
    return response.data;
  },

  // Get active semester
  getActiveSemester: async () => {
    const response = await api.get<ApiResponse<SemesterDto>>(
      "/api/semester/active",
    );
    return response.data;
  },

  // Get semester by ID
  getSemesterById: async (id: number) => {
    const response = await api.get<ApiResponse<SemesterDto>>(
      `/api/semester/${id}`,
    );
    return response.data;
  },

  // Create semester (Admin only)
  createSemester: async (dto: CreateSemesterDto) => {
    const response = await api.post<ApiResponse<SemesterDto>>(
      "/api/semester",
      dto,
    );
    return response.data;
  },

  // Update semester (Admin only)
  updateSemester: async (id: number, dto: UpdateSemesterDto) => {
    const response = await api.put<ApiResponse<SemesterDto>>(
      `/api/semester/${id}`,
      dto,
    );
    return response.data;
  },

  // Delete semester (Admin only)
  deleteSemester: async (id: number) => {
    await api.delete(`/api/semester/${id}`);
  },
};
