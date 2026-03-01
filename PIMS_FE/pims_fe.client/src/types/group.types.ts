export interface GroupDto {
    groupId: number;
    groupName: string;
    semesterId: number;
    semesterName: string;
    leaderId: number;
    leaderName: string;
    mentorId?: number | null;
    mentorName?: string | null;
    statusId: number;
    statusName: string;
    isLeader: boolean;
    memberCount: number;
}

export interface GroupMemberDto {
    groupMemberId: number;
    userId: number;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
    statusId: number;
    statusName: string;
}

export interface GroupDetailDto extends GroupDto {
    members: GroupMemberDto[];
}

export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

