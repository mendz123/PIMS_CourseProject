import api from './api';
import type { ApiResponse } from '../types';
import type { GroupDto, GroupDetailDto, PaginatedResponse } from '../types/group.types';

export const groupService = {
    async getMyGroup(): Promise<ApiResponse<GroupDto | null>> {
        const response = await api.get<ApiResponse<GroupDto | null>>('/api/group/my-group');
        return response.data;
    },

    async createGroup(groupName: string): Promise<ApiResponse<GroupDto>> {
        const response = await api.post<ApiResponse<GroupDto>>('/api/group', { groupName });
        return response.data;
    },

    async getGroups(params?: {
        search?: string;
        pageNumber?: number;
        pageSize?: number;
    }): Promise<ApiResponse<PaginatedResponse<GroupDto>>> {
        const response = await api.get<ApiResponse<PaginatedResponse<GroupDto>>>('/api/group', { params });
        return response.data;
    },

    async getGroupDetail(groupId: number): Promise<ApiResponse<GroupDetailDto>> {
        const response = await api.get<ApiResponse<GroupDetailDto>>(`/api/group/${groupId}`);
        return response.data;
    },
};

