import api from "./api";
import type { ApiResponse } from "../types/assessment.types";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface DefenseScheduleDto {
  scheduleId: number;
  councilId: number;
  councilName: string;
  groupId: number;
  groupName: string;
  defenseDate: string | null; // "YYYY-MM-DD"
  startTime: string | null; // "HH:mm:ss"
  endTime: string | null; // "HH:mm:ss"
  roomId: number | null;
  roomName: string | null;
  location: string | null;
  status: string | null;
}

export interface CreateDefenseScheduleDto {
  councilId: number;
  groupId: number;
  defenseDate: string;
  startTime: string;
  endTime: string;
  roomId?: number;
}

export interface AssignRoomDto {
  roomId: number | null;
}

// GroupInfo — mirrors GroupDto from groupService but kept minimal
export interface GroupInfo {
  groupId: number;
  groupName: string | null;
  semesterId: number | null;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const defenseScheduleService = {
  getAll: async (semesterId?: number, councilId?: number) => {
    const params: Record<string, number> = {};
    if (semesterId !== undefined) params.semesterId = semesterId;
    if (councilId !== undefined) params.councilId = councilId;
    const response = await api.get<ApiResponse<DefenseScheduleDto[]>>(
      "/api/defense-schedule",
      { params },
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<DefenseScheduleDto>>(
      `/api/defense-schedule/${id}`,
    );
    return response.data;
  },

  create: async (dto: CreateDefenseScheduleDto) => {
    const response = await api.post<ApiResponse<DefenseScheduleDto>>(
      "/api/defense-schedule",
      dto,
    );
    return response.data;
  },

  assignRoom: async (scheduleId: number, roomId: number | null) => {
    const response = await api.patch<ApiResponse<DefenseScheduleDto>>(
      `/api/defense-schedule/${scheduleId}/room`,
      { roomId },
    );
    return response.data;
  },

  /** Teacher: get only schedules where current user is a council member */
  getMySchedule: async () => {
    const response = await api.get<ApiResponse<DefenseScheduleDto[]>>(
      "/api/defense-schedule/my-schedule",
    );
    return response.data;
  },

  /** Fetch all groups (with large pageSize to get all at once) */
  getGroups: async (semesterId?: number): Promise<ApiResponse<GroupInfo[]>> => {
    const params: Record<string, number | string> = { pageSize: 200 };
    if (semesterId !== undefined) params.semesterId = semesterId;
    // The team's GroupController returns PaginatedResponse<GroupDto>
    // We map items → GroupInfo[]
    const response = await api.get<
      ApiResponse<{ items: GroupInfo[]; totalCount: number }>
    >("/api/group", { params });
    const raw = response.data;
    // Flatten so callers can do `res.data` as GroupInfo[]
    return {
      ...raw,
      data: raw.data?.items ?? [],
    } as unknown as ApiResponse<GroupInfo[]>;
  },
};
