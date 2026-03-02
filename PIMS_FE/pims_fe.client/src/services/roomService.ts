import api from "./api";
import type { ApiResponse } from "../types/assessment.types";

export interface RoomDto {
    roomId: number;
    roomName: string;
    building: string | null;
    capacity: number | null;
}

export interface CreateRoomDto {
    roomName: string;
    building?: string;
    capacity?: number;
}

export interface UpdateRoomDto {
    roomName?: string;
    building?: string;
    capacity?: number;
}

export const roomService = {
    getAllRooms: async () => {
        const res = await api.get<ApiResponse<RoomDto[]>>("/api/room");
        return res.data;
    },

    createRoom: async (dto: CreateRoomDto) => {
        const res = await api.post<ApiResponse<RoomDto>>("/api/room", dto);
        return res.data;
    },

    updateRoom: async (id: number, dto: UpdateRoomDto) => {
        const res = await api.put<ApiResponse<RoomDto>>(`/api/room/${id}`, dto);
        return res.data;
    },

    deleteRoom: async (id: number) => {
        const res = await api.delete<ApiResponse<string>>(`/api/room/${id}`);
        return res.data;
    },
};
