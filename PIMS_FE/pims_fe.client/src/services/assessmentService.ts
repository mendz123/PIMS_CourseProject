import api from "./api";
import type {
  AssessmentDto,
  CreateAssessmentDto,
  UpdateAssessmentDto,
  AssessmentCriterionDto,
  CreateCriterionDto,
  UpdateCriterionDto,
  BatchCreateCriteriaDto,
  AssessmentWithCriteriaDto,
  ApiResponse,
} from "../types/assessment.types";

// Assessment APIs
export const assessmentService = {
  // Get all assessments by semester
  getAssessmentsBySemester: async (semesterId: number) => {
    const response = await api.get<ApiResponse<AssessmentDto[]>>(
      `/api/assessment/semester/${semesterId}`,
    );
    return response.data;
  },

  // Get assessments with criteria by semester
  getAssessmentsWithCriteria: async (semesterId: number) => {
    const response = await api.get<ApiResponse<AssessmentWithCriteriaDto[]>>(
      `/api/assessment/semester/${semesterId}/with-criteria`,
    );
    return response.data;
  },

  // Get assessment by ID
  getAssessmentById: async (id: number) => {
    const response = await api.get<ApiResponse<AssessmentDto>>(
      `/api/assessment/${id}`,
    );
    return response.data;
  },

  // Get assessment with criteria by ID
  getAssessmentWithCriteria: async (id: number) => {
    const response = await api.get<ApiResponse<AssessmentWithCriteriaDto>>(
      `/api/assessment/${id}/with-criteria`,
    );
    return response.data;
  },

  // Create new assessment
  createAssessment: async (dto: CreateAssessmentDto) => {
    const response = await api.post<ApiResponse<AssessmentDto>>(
      "/api/assessment",
      dto,
    );
    return response.data;
  },

  // Update assessment
  updateAssessment: async (id: number, dto: UpdateAssessmentDto) => {
    const response = await api.put<ApiResponse<AssessmentDto>>(
      `/api/assessment/${id}`,
      dto,
    );
    return response.data;
  },

  // Delete assessment
  deleteAssessment: async (id: number) => {
    const response = await api.delete<ApiResponse<object>>(
      `/api/assessment/${id}`,
    );
    return response.data;
  },

  // Lock assessment
  lockAssessment: async (id: number) => {
    const response = await api.post<ApiResponse<object>>(
      `/api/assessment/${id}/lock`,
    );
    return response.data;
  },

  // Unlock assessment
  unlockAssessment: async (id: number) => {
    const response = await api.post<ApiResponse<object>>(
      `/api/assessment/${id}/unlock`,
    );
    return response.data;
  },

  // Validate assessment weights
  validateAssessmentWeights: async (semesterId: number) => {
    const response = await api.get<ApiResponse<{ isValid: boolean }>>(
      `/api/assessment/semester/${semesterId}/validate-weights`,
    );
    return response.data;
  },
};

// Criteria APIs
export const criteriaService = {
  // Get all criteria by assessment
  getCriteriaByAssessmentId: async (assessmentId: number) => {
    const response = await api.get<ApiResponse<AssessmentCriterionDto[]>>(
      `/api/assessments/${assessmentId}/criteria`,
    );
    return response.data;
  },

  // Get criterion by ID
  getCriterionById: async (assessmentId: number, criteriaId: number) => {
    const response = await api.get<ApiResponse<AssessmentCriterionDto>>(
      `/api/assessments/${assessmentId}/criteria/${criteriaId}`,
    );
    return response.data;
  },

  // Create criterion
  createCriterion: async (assessmentId: number, dto: CreateCriterionDto) => {
    const response = await api.post<ApiResponse<AssessmentCriterionDto>>(
      `/api/assessments/${assessmentId}/criteria`,
      dto,
    );
    return response.data;
  },

  // Create multiple criteria (batch)
  createMultipleCriteria: async (
    assessmentId: number,
    dto: BatchCreateCriteriaDto,
  ) => {
    const response = await api.post<ApiResponse<AssessmentCriterionDto[]>>(
      `/api/assessments/${assessmentId}/criteria/batch`,
      dto,
    );
    return response.data;
  },

  // Update criterion
  updateCriterion: async (
    assessmentId: number,
    criteriaId: number,
    dto: UpdateCriterionDto,
  ) => {
    const response = await api.put<ApiResponse<AssessmentCriterionDto>>(
      `/api/assessments/${assessmentId}/criteria/${criteriaId}`,
      dto,
    );
    return response.data;
  },

  // Delete criterion
  deleteCriterion: async (assessmentId: number, criteriaId: number) => {
    const response = await api.delete<ApiResponse<object>>(
      `/api/assessments/${assessmentId}/criteria/${criteriaId}`,
    );
    return response.data;
  },

  // Validate criteria weights
  validateCriteriaWeights: async (assessmentId: number) => {
    const response = await api.get<ApiResponse<{ isValid: boolean }>>(
      `/api/assessments/${assessmentId}/criteria/validate-weights`,
    );
    return response.data;
  },
};
