// Assessment & Criteria Types
export interface AssessmentDto {
  assessmentId: number;
  semesterId: number;
  title: string;
  weight: number;
  isFinal: boolean;
  isLocked: boolean;
  createdBy: number;
  createdAt: string;
  createdByName: string;
  isRetake: boolean;
  criteria?: AssessmentCriterionDto[];
}

export interface CreateAssessmentDto {
  semesterId: number;
  title: string;
  weight: number;
  isFinal: boolean;
  startDate?: string;
  deadline?: string;
  description?: string;
}

export interface UpdateAssessmentDto {
  title?: string;
  weight?: number;
  isFinal?: boolean;
  isLocked?: boolean;
  startDate?: string;
  deadline?: string;
  description?: string;
}

export interface AssessmentCriterionDto {
  criteriaId: number;
  assessmentId: number;
  criteriaName: string;
  weight: number;
}

export interface CreateCriterionDto {
  criteriaName: string;
  weight: number;
}

export interface UpdateCriterionDto {
  criteriaName?: string;
  weight?: number;
}

export interface BatchCreateCriteriaDto {
  criteria: CreateCriterionDto[];
}

export interface BatchCreateAssessmentItemDto {
  title: string;
  weight: number;
  isFinal: boolean;
  startDate?: string;
  deadline?: string;
  description?: string;
}

export interface BatchCreateAssessmentsDto {
  semesterId: number;
  assessments: BatchCreateAssessmentItemDto[];
}

export interface AssessmentWithCriteriaDto {
  assessmentId: number;
  semesterId: number;
  title: string;
  weight: number;
  isFinal: boolean;
  isLocked: boolean;
  startDate?: string;
  deadline?: string;
  description?: string;
  hasSubmissions?: boolean;
  hasScores?: boolean;
  criteria: AssessmentCriterionDto[];
  totalCriteriaWeight: number;
  isRetake: boolean;
  isValid: boolean;
}

export interface StudentScoreDto {
  userId: number;
  score: number;
}

export interface SaveGradesDto {
  assessmentId: number;
  groupId: number;
  teacherComment?: string;
  studentScores: StudentScoreDto[];
}

export interface CouncilStudentScoreDto {
  userId: number;
  criteriaScores: { [criteriaId: number]: number };
}

export interface SaveCouncilGradesDto {
  councilId: number;
  groupId: number;
  assessmentId: number;
  studentScores: CouncilStudentScoreDto[];
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: string[];
  timestamp: string;
}

// ---- Student view: assessment của bản thân ----
export interface StudentAssessmentItemDto {
  assessmentId: number;
  title: string;
  weight: number;
  isFinal: boolean;
  startDate?: string;
  deadline?: string;
  description?: string;
  score?: number;
  isPassed?: boolean;
  teacherComment?: string;
  // Assessment criteria
  criteria?: AssessmentCriterionDto[];
  // Chỉ có khi isFinal == true
  defenseDate?: string; // DateOnly -> "YYYY-MM-DD"
  defenseStartTime?: string; // TimeOnly -> "HH:mm:ss"
  defenseEndTime?: string;
  roomId?: number;
  roomName?: string;
  roomLocation?: string;
  defenseStatus?: string;
}

export interface StudentMyAssessmentsDto {
  projectId?: number;
  projectTitle?: string;
  projectDescription?: string;
  groupId: number;
  groupName: string;
  semesterId: number;
  semesterName: string;
  assessments: StudentAssessmentItemDto[];
}
