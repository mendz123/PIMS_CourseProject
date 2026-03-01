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

export interface InvitationDto {
    invitationId: number;
    groupId: number;
    groupName: string;
    invitedUserId: number;
    invitedUserName: string;
    invitedByUserId: number;
    invitedByUserName: string;
    status: string;
    createdAt: string;
}

export interface InvitationDetailDto {
    invitationId: number;
    groupId: number;
    groupName: string;
    leaderId: number;
    leaderName: string;
    memberCount: number;
    members: GroupMemberDto[];
    invitedByUserName: string;
    status: string;
}

export interface MentorRequestDto {
    requestId: number;
    groupId: number;
    groupName: string;
    leaderId: number;
    leaderName: string;
    mentorUserId: number;
    mentorUserName: string;
    message?: string | null;
    status: string;
    createdAt?: string | null;
}

export interface MentorRequestDetailDto {
    requestId: number;
    groupId: number;
    groupName: string;
    leaderId: number;
    leaderName: string;
    memberCount: number;
    members: GroupMemberDto[];
    message?: string | null;
    status: string;
    createdAt?: string | null;
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

