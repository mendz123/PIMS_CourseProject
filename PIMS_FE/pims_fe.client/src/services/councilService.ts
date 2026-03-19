import api from "./api";
import type { ApiResponse } from "../types/assessment.types";

export interface CouncilMemberDto {
    userId: number;
    fullName: string;
    email: string;
}

export interface CouncilDto {
    councilId: number;
    councilName: string;
    semesterId: number;
    semesterName: string;
    members: CouncilMemberDto[];
}

export interface CreateCouncilDto {
    councilName: string;
    semesterId: number;
    memberUserIds: number[];
}

export interface UpdateCouncilDto {
    councilName?: string;
    memberUserIds?: number[];
}

// Teacher/UserInfo for member picker (matches BE UserInfo)
export interface TeacherInfo {
    userId: number;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: string | null;
    status: string | null;
}

export const councilService = {
    // Get all councils, optionally filtered by semester
    getAllCouncils: async (semesterId?: number) => {
        const params = semesterId ? `?semesterId=${semesterId}` : "";
        const response = await api.get<ApiResponse<CouncilDto[]>>(
            `/api/council${params}`,
        );
        return response.data;
    },

    // Get council by ID
    getCouncilById: async (id: number) => {
        const response = await api.get<ApiResponse<CouncilDto>>(
            `/api/council/${id}`,
        );
        return response.data;
    },

    // Create council (SUBJECT_HEAD only)
    createCouncil: async (dto: CreateCouncilDto) => {
        const response = await api.post<ApiResponse<CouncilDto>>(
            "/api/council",
            dto,
        );
        return response.data;
    },

    // Update council (SUBJECT_HEAD only)
    updateCouncil: async (id: number, dto: UpdateCouncilDto) => {
        const response = await api.put<ApiResponse<CouncilDto>>(
            `/api/council/${id}`,
            dto,
        );
        return response.data;
    },

    // Get all teachers — for council member picker
    getTeachers: async () => {
        const response = await api.get<ApiResponse<TeacherInfo[]>>(
            "/api/user/teachers",
        );
        return response.data;
    },

    // Delete council (SUBJECT_HEAD only)
    deleteCouncil: async (id: number) => {
        await api.delete(`/api/council/${id}`);
    },
};
