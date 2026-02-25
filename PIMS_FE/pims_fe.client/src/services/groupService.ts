import api from './api';
import type { ApiResponse } from '../types';
import type { GroupDto } from '../types/group.types';

export const groupService = {
    async getMyGroup(): Promise<ApiResponse<GroupDto | null>> {
        const response = await api.get<ApiResponse<GroupDto | null>>('/api/group/my-group');
        return response.data;
    },

    async createGroup(groupName: string): Promise<ApiResponse<GroupDto>> {
        const response = await api.post<ApiResponse<GroupDto>>('/api/group', { groupName });
        return response.data;
    },
};
