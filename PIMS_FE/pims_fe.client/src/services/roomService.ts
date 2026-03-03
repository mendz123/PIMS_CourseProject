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
        const response = await api.get<ApiResponse<RoomDto[]>>("/api/room");
        return response.data;
    },

    getRoomById: async (id: number) => {
        const response = await api.get<ApiResponse<RoomDto>>(`/api/room/${id}`);
        return response.data;
    },

    createRoom: async (dto: CreateRoomDto) => {
        const response = await api.post<ApiResponse<RoomDto>>("/api/room", dto);
        return response.data;
    },

    updateRoom: async (id: number, dto: UpdateRoomDto) => {
        const response = await api.put<ApiResponse<RoomDto>>(`/api/room/${id}`, dto);
        return response.data;
    },

    deleteRoom: async (id: number) => {
        await api.delete(`/api/room/${id}`);
    },
};
