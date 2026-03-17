import api from './api';
import type { ApiResponse } from '../types';
import type { GroupDto, GroupDetailDto, InvitationDto, InvitationDetailDto, MentorRequestDto, MentorRequestDetailDto, PaginatedResponse, RegisterTopicRequestDto, ProjectDto } from '../types/group.types';
export interface GroupSubmissionDto {
    id: number;
    name: string;
    url: string;
    submittedAt: string | null;
    assessmentId: number;
}

export interface TeacherGroupDto {
    groupId: number;
    groupName: string;
    semesterName?: string;
    topicName?: string;
    memberCount: number;
    students: {
        userId: number;
        fullName: string;
        scores: { [assessmentId: number]: number };
        criteriaScores?: { [assessmentId: number]: { [criteriaId: number]: number } };
        totalScore?: number;
    }[];
    teacherComments: { [assessmentId: number]: string };
    submittedDocs: GroupSubmissionDto[];
}

export interface StudentCriteriaScoreDto {
    userId: number;
    criteriaScores: { [criteriaId: number]: number };
}

export interface SaveGradesByCriteriaDto {
    assessmentId: number;
    groupId: number;
    teacherComment?: string;
    studentScores: StudentCriteriaScoreDto[];
}


export const groupService = {
    getGroupsByTeacher: async (semesterId?: number) => {
        const url = semesterId ? `/api/Group/my-group-as-teacher?semesterId=${semesterId}` : '/api/Group/my-group-as-teacher';
        const response = await api.get<ApiResponse<TeacherGroupDto[]>>(url);
        return response.data;
    },

    async getMyGroup(): Promise<ApiResponse<GroupDto | null>> {
        const response = await api.get<ApiResponse<GroupDto | null>>('/api/group/my-group');
        return response.data;
    },

    async getMyGroupDetail(): Promise<ApiResponse<GroupDetailDto | null>> {
        const response = await api.get<ApiResponse<GroupDetailDto | null>>('/api/group/my-group/detail');
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

    async inviteMember(groupId: number, invitedEmail: string): Promise<ApiResponse<InvitationDto>> {
        const response = await api.post<ApiResponse<InvitationDto>>(`/api/group/${groupId}/invite`, { invitedEmail });
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

    // ??? Mentor Request ??????????????????????????????????????????????????????

    async inviteMentor(groupId: number, mentorEmail: string, message?: string): Promise<ApiResponse<MentorRequestDto>> {
        const response = await api.post<ApiResponse<MentorRequestDto>>(`/api/group/${groupId}/invite-mentor`, { mentorEmail, message });
        return response.data;
    },

    async getPendingMentorRequests(): Promise<ApiResponse<MentorRequestDto[]>> {
        const response = await api.get<ApiResponse<MentorRequestDto[]>>('/api/group/mentor-requests/pending');
        return response.data;
    },

    async getMentorRequestDetail(requestId: number): Promise<ApiResponse<MentorRequestDetailDto>> {
        const response = await api.get<ApiResponse<MentorRequestDetailDto>>(`/api/group/mentor-requests/${requestId}/detail`);
        return response.data;
    },

    async acceptMentorRequest(requestId: number): Promise<ApiResponse<GroupDto>> {
        const response = await api.post<ApiResponse<GroupDto>>(`/api/group/mentor-requests/${requestId}/accept`);
        return response.data;
    },

    async rejectMentorRequest(requestId: number): Promise<ApiResponse<string>> {
        const response = await api.post<ApiResponse<string>>(`/api/group/mentor-requests/${requestId}/reject`);
        return response.data;
    },

    // ??? Topic Registration ???????????????????????????????????????????????????

    async registerTopic(groupId: number, dto: RegisterTopicRequestDto): Promise<ApiResponse<ProjectDto>> {
        const response = await api.post<ApiResponse<ProjectDto>>(`/api/group/${groupId}/register-topic`, dto);
        return response.data;
    },

    async updateTopic(groupId: number, dto: RegisterTopicRequestDto): Promise<ApiResponse<ProjectDto>> {
        const response = await api.put<ApiResponse<ProjectDto>>(`/api/group/${groupId}/update-topic`, dto);
        return response.data;
    },

    async leaveGroup(): Promise<ApiResponse<string>> {
        const response = await api.post<ApiResponse<string>>('/api/group/leave');
        return response.data;
    },
};
