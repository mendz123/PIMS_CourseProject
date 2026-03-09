export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: string[];
  timestamp: string;
}

export interface User {
  userId: number;
  email: string;
  fullName?: string;
  role?: string;
  isLoginGoogle?: boolean;
  avatarUrl?: string;
  phoneNumber?: string;
  bio?: string;
  status?: string;
  createdAt?: string;
}

export interface PagedResult<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: T[];
}

export interface LecturerMentoringGroupInfo {
  groupId: number;
  groupName: string | null;
  semesterId: number;
  semesterName: string | null;
}

export interface LecturerCouncilGroupInfo {
  groupId: number;
  groupName: string | null;
  councilId: number;
  councilName: string | null;
  semesterName: string | null;
  defenseDate: string | null;
}

export interface LecturerSummaryDto {
  userId: number;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  mentoringGroups: LecturerMentoringGroupInfo[];
  councilGroups: LecturerCouncilGroupInfo[];
}
