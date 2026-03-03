import api from "./api";
import type { ApiResponse } from "../types/assessment.types";

export interface DefenseScheduleDto {
    scheduleId: number;
    councilId: number;
    councilName: string;
    groupId: number;
    groupName: string;
    defenseDate: string | null;  // DateOnly → "YYYY-MM-DD"
    startTime: string | null;    // TimeOnly → "HH:mm:ss"
    endTime: string | null;
    roomId: number | null;
    roomName: string | null;
    location: string | null;
    status: string | null;
}

export interface CreateDefenseScheduleDto {
    councilId: number;
    groupId: number;
    defenseDate: string;   // "YYYY-MM-DD"
    startTime: string;     // "HH:mm:ss"
    endTime: string;
    roomId?: number;
}

export interface GroupInfo {
    groupId: number;
    groupName: string;
    semesterId: number;
}

export const defenseScheduleService = {
    getAll: async (semesterId?: number, councilId?: number) => {
        const params = new URLSearchParams();
        if (semesterId !== undefined) params.append("semesterId", String(semesterId));
        if (councilId !== undefined) params.append("councilId", String(councilId));
        const query = params.toString() ? `?${params}` : "";
        const res = await api.get<ApiResponse<DefenseScheduleDto[]>>(`/api/defense-schedule${query}`);
        return res.data;
    },

    create: async (dto: CreateDefenseScheduleDto) => {
        const res = await api.post<ApiResponse<DefenseScheduleDto>>("/api/defense-schedule", dto);
        return res.data;
    },

    assignRoom: async (scheduleId: number, roomId: number | null) => {
        const res = await api.patch<ApiResponse<DefenseScheduleDto>>(
            `/api/defense-schedule/${scheduleId}/room`,
            { roomId },
        );
        return res.data;
    },

    getGroups: async (semesterId?: number) => {
        const query = semesterId !== undefined ? `?semesterId=${semesterId}` : "";
        const res = await api.get<ApiResponse<GroupInfo[]>>(`/api/group${query}`);
        return res.data;
    },
};
