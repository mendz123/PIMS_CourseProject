import api from "./api";
import type { ApiResponse } from "../types/assessment.types";

export interface SemesterDto {
  semesterId: number;
  semesterName: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean | null;
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
};
