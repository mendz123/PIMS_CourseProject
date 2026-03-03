import api from './api';
import type { ApiResponse } from '../types/assessment.types';

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
    memberCount: number;
    students: {
        userId: number;
        fullName: string;
        scores: { [assessmentId: number]: number };
    }[];
    teacherComments: { [assessmentId: number]: string };
    submittedDocs: GroupSubmissionDto[];
}

export const groupService = {
    getGroupsByTeacher: async (semesterId?: number) => {
        const url = semesterId ? `/api/Group/my-group-as-teacher?semesterId=${semesterId}` : '/api/Group/my-group-as-teacher';
        const response = await api.get<ApiResponse<TeacherGroupDto[]>>(url);
        return response.data;
    }
};
