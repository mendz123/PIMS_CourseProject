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
  criteria?: AssessmentCriterionDto[];
}

export interface CreateAssessmentDto {
  semesterId: number;
  title: string;
  weight: number;
  isFinal: boolean;
}

export interface UpdateAssessmentDto {
  title?: string;
  weight?: number;
  isFinal?: boolean;
  isLocked?: boolean;
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

export interface AssessmentWithCriteriaDto {
  assessmentId: number;
  semesterId: number;
  title: string;
  weight: number;
  isFinal: boolean;
  isLocked: boolean;
  criteria: AssessmentCriterionDto[];
  totalCriteriaWeight: number;
  isValid: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: string[];
  timestamp: string;
}
