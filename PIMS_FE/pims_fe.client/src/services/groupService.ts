import api from './api';
import type { ApiResponse } from '../types';
import type { GroupDto, GroupDetailDto, InvitationDto, InvitationDetailDto, PaginatedResponse } from '../types/group.types';

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

    async inviteMember(groupId: number, invitedUserId: number): Promise<ApiResponse<InvitationDto>> {
        const response = await api.post<ApiResponse<InvitationDto>>(`/api/group/${groupId}/invite`, { invitedUserId });
        return response.data;
    },

    async getPendingInvitations(): Promise<ApiResponse<InvitationDto[]>> {
        const response = await api.get<ApiResponse<InvitationDto[]>>('/api/group/invitations/pending');
        return response.data;
    },

    async acceptInvitation(invitationId: number): Promise<ApiResponse<GroupDto>> {
        const response = await api.post<ApiResponse<GroupDto>>(`/api/group/invitations/${invitationId}/accept`);
        return response.data;
    },

    async rejectInvitation(invitationId: number): Promise<ApiResponse<string>> {
        const response = await api.post<ApiResponse<string>>(`/api/group/invitations/${invitationId}/reject`);
        return response.data;
    },

    async getInvitationDetail(invitationId: number): Promise<ApiResponse<InvitationDetailDto>> {
        const response = await api.get<ApiResponse<InvitationDetailDto>>(`/api/group/invitations/${invitationId}/detail`);
        return response.data;
    },
};

