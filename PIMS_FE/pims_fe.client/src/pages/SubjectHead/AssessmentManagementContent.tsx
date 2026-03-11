import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  assessmentService,
  criteriaService,
} from "../../services/assessmentService";
import {
  semesterService,
  type SemesterDto,
} from "../../services/semesterService";
import type {
  AssessmentWithCriteriaDto,
  CreateCriterionDto,
} from "../../types/assessment.types";

interface TemplateDto {
  templateId: number;
  templateName: string;
  templateUrl: string;
  fileResourceId?: string;
  createdAt?: string;
}

const AssessmentManagementContent: React.FC = () => {
  const [assessments, setAssessments] = useState<AssessmentWithCriteriaDto[]>(
    [],
  );
  const [semesters, setSemesters] = useState<SemesterDto[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Modal states
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [showBatchEditModal, setShowBatchEditModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentWithCriteriaDto | null>(null);

  // Template Upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [templateForm, setTemplateForm] = useState<{
    title: string;
    file: File | null;
  }>({ title: "", file: null });

  // Template Data state
  const [templates, setTemplates] = useState<TemplateDto[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    body: string;
    confirmLabel: string;
    variant: "danger" | "warning";
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Form states
  const emptyBatchItem = () => ({
    title: "",
    weight: 0,
    isFinal: false,
    startDate: "",
    deadline: "",
    description: "",
  });
  const [batchForms, setBatchForms] = useState<
    Array<{
      title: string;
      weight: number;
      isFinal: boolean;
      startDate: string;
      deadline: string;
      description: string;
    }>
  >([emptyBatchItem()]);

  // Batch edit state
  const [batchEditForms, setBatchEditForms] = useState<
    Array<{
      assessmentId: number;
      title: string;
      weight: number;
      isFinal: boolean;
      startDate: string;
      deadline: string;
      description: string;
      isLocked: boolean;
      hasSubmissions: boolean;
      hasScores: boolean;
      isNew?: boolean;
      isDeleted?: boolean;
    }>
  >([]);

  const [criteriaList, setCriteriaList] = useState<CreateCriterionDto[]>([
    { criteriaName: "", weight: 0 },
  ]);

  useEffect(() => {
    loadSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemesterId !== null) {
      loadAssessments();
      loadTemplates();
    }
  }, [selectedSemesterId]);

  const loadSemesters = async () => {
    try {
      const response = await semesterService.getAllSemesters();
      const activeSemesters = response.data.filter((s) => s.isActive);
      setSemesters(activeSemesters);
      if (activeSemesters.length > 0) {
        setSelectedSemesterId(activeSemesters[0].semesterId);
      }
    } catch (err: any) {
      console.error("Failed to load semesters:", err);
      setError("Failed to load semesters");
    }
  };

  const loadAssessments = async () => {
    if (selectedSemesterId === null) return;
    setLoading(true);
    setError("");
    try {
      const response =
        await assessmentService.getAssessmentsWithCriteria(selectedSemesterId);
      setAssessments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    if (selectedSemesterId === null) return;
    setTemplatesLoading(true);
    try {
      const response = await api.get(
        `/api/ProjectTemplate/semester/${selectedSemesterId}`,
      );
      if (response.data.success) {
        setTemplates(response.data.data);
      }
    } catch (err: any) {
      console.error("Failed to load templates:", err);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleDeleteTemplate = (templateId: number) => {
    setConfirmDialog({
      title: "Delete Template",
      body: "Are you sure you want to delete this template? This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: async () => {
        setTemplatesLoading(true);
        setError("");
        try {
          const response = await api.delete(
            `/api/ProjectTemplate/${templateId}`,
          );
          if (response.data.success) {
            setSuccess("Template deleted successfully");
            loadTemplates();
          }
        } catch (err: any) {
          setError(err.response?.data?.message || "Failed to delete template");
        } finally {
          setTemplatesLoading(false);
        }
      },
    });
  };

  const handleBatchCreateAssessments = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalWeight = batchForms.reduce(
      (sum, item) => sum + (item.weight || 0),
      0,
    );
    if (Math.abs(totalWeight - 100) > 0.01) {
      setError(
        `Total weight must be exactly 100%. Currently: ${totalWeight.toFixed(2)}%`,
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      await assessmentService.batchCreateAssessments({
        semesterId: selectedSemesterId!,
        assessments: batchForms.map((f) => ({
          title: f.title,
          weight: f.weight,
          isFinal: f.isFinal,
          startDate: f.startDate || undefined,
          deadline: f.deadline || undefined,
          description: f.description || undefined,
        })),
      });
      setSuccess("Assessments created successfully");
      setShowAssessmentModal(false);
      setBatchForms([emptyBatchItem()]);
      loadAssessments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchUpdateAssessments = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalWeight = batchEditForms
      .filter((item) => !item.isDeleted)
      .reduce((sum, item) => sum + (item.weight || 0), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      setError(
        `Total weight must be exactly 100%. Currently: ${totalWeight.toFixed(2)}%`,
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const toDelete = batchEditForms.filter((f) => f.isDeleted && !f.isNew);
      await Promise.all(
        toDelete.map((f) => assessmentService.deleteAssessment(f.assessmentId)),
      );
      const editableForms = batchEditForms.filter(
        (f) => !f.isLocked && !f.hasScores && !f.isNew && !f.isDeleted,
      );
      const newForms = batchEditForms.filter((f) => f.isNew && !f.isDeleted);
      await Promise.all(
        editableForms.map((f) =>
          assessmentService.updateAssessment(f.assessmentId, {
            title: f.title,
            weight: f.weight,
            isFinal: f.isFinal,
            startDate: f.startDate || undefined,
            deadline: f.deadline || undefined,
            description: f.description || undefined,
          }),
        ),
      );
      await Promise.all(
        newForms.map((f) =>
          assessmentService.createAssessment({
            semesterId: selectedSemesterId!,
            title: f.title,
            weight: f.weight,
            isFinal: f.isFinal,
            startDate: f.startDate || undefined,
            deadline: f.deadline || undefined,
            description: f.description || undefined,
          }),
        ),
      );
      setSuccess("Assessments saved successfully");
      setShowBatchEditModal(false);
      loadAssessments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleLockToggle = (assessment: AssessmentWithCriteriaDto) => {
    if (assessment.isLocked) {
      setConfirmDialog({
        title: "Unlock Assessment",
        body: `Unlock "${assessment.title}"?\n\nThis will allow modifications to criteria and weights. Note: you cannot unlock if scores have already been recorded.`,
        confirmLabel: "Unlock",
        variant: "warning",
        onConfirm: async () => {
          setLoading(true);
          setError("");
          setSuccess("");
          try {
            await assessmentService.unlockAssessment(assessment.assessmentId);
            setSuccess(
              "Assessment unlocked. You can now edit criteria and weights.",
            );
            loadAssessments();
          } catch (err: any) {
            setError(
              err.response?.data?.message || "Failed to unlock assessment",
            );
            setTimeout(() => setError(""), 8000);
          } finally {
            setLoading(false);
          }
        },
      });
    } else {
      setConfirmDialog({
        title: "Lock Assessment",
        body: `Lock "${assessment.title}"?\n\nAfter locking, criteria and weights can no longer be modified. Make sure everything is correct before proceeding.`,
        confirmLabel: "Lock",
        variant: "warning",
        onConfirm: async () => {
          setLoading(true);
          setError("");
          setSuccess("");
          try {
            await assessmentService.lockAssessment(assessment.assessmentId);
            setSuccess("Assessment locked. No further modifications allowed.");
            loadAssessments();
          } catch (err: any) {
            setError(
              err.response?.data?.message || "Failed to lock assessment",
            );
            setTimeout(() => setError(""), 8000);
          } finally {
            setLoading(false);
          }
        },
      });
    }
  };

  const handleSaveCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await criteriaService.createMultipleCriteria(
        selectedAssessment.assessmentId,
        {
          criteria: criteriaList,
        },
      );
      setSuccess("Criteria saved successfully");
      setShowCriteriaModal(false);
      setCriteriaList([{ criteriaName: "", weight: 0 }]);
      loadAssessments();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        err.message ||
        "Failed to save criteria";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetAssessmentForm = () => {
    setBatchForms([emptyBatchItem()]);
  };

  const openBatchEditModal = () => {
    setBatchEditForms(
      assessments.map((a) => ({
        assessmentId: a.assessmentId,
        title: a.title,
        weight: a.weight,
        isFinal: a.isFinal,
        startDate: a.startDate ? a.startDate.slice(0, 16) : "",
        deadline: a.deadline ? a.deadline.slice(0, 16) : "",
        description: a.description ?? "",
        isLocked: a.isLocked,
        hasSubmissions: a.hasSubmissions ?? false,
        hasScores: a.hasScores ?? false,
      })),
    );
    setShowBatchEditModal(true);
  };

  const addBatchEditItem = () =>
    setBatchEditForms([
      ...batchEditForms,
      {
        assessmentId: 0,
        title: "",
        weight: 0,
        isFinal: false,
        startDate: "",
        deadline: "",
        description: "",
        isLocked: false,
        hasSubmissions: false,
        hasScores: false,
        isNew: true,
      },
    ]);

  const removeBatchEditItem = (index: number) =>
    setBatchEditForms(batchEditForms.filter((_, i) => i !== index));

  const handleDeleteFromBatchEdit = (index: number, _title: string) => {
    setBatchEditForms((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isDeleted: true } : item,
      ),
    );
  };

  const updateBatchEditItem = (index: number, field: string, value: any) => {
    const updated = [...batchEditForms];
    updated[index] = { ...updated[index], [field]: value };
    setBatchEditForms(updated);
  };

  const openCriteriaModal = (assessment: AssessmentWithCriteriaDto) => {
    setSelectedAssessment(assessment);
    if (assessment.criteria && assessment.criteria.length > 0) {
      setCriteriaList(
        assessment.criteria.map((c) => ({
          criteriaName: c.criteriaName,
          weight: c.weight,
        })),
      );
    } else {
      setCriteriaList([{ criteriaName: "", weight: 0 }]);
    }
    setShowCriteriaModal(true);
  };

  const addCriterion = () =>
    setCriteriaList([...criteriaList, { criteriaName: "", weight: 0 }]);
  const removeCriterion = (index: number) =>
    setCriteriaList(criteriaList.filter((_, i) => i !== index));
  const updateCriterion = (
    index: number,
    field: keyof CreateCriterionDto,
    value: any,
  ) => {
    const updated = [...criteriaList];
    updated[index] = { ...updated[index], [field]: value };
    setCriteriaList(updated);
  };

  const todayDateTimeLocal = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getTotalWeight = () =>
    assessments.reduce((sum, a) => sum + a.weight, 0);
  const getCriteriaTotalWeight = () =>
    criteriaList.reduce((sum, c) => sum + c.weight, 0);
  const getBatchTotalWeight = () =>
    batchForms.reduce((sum, item) => sum + (item.weight || 0), 0);
  const getBatchEditTotalWeight = () =>
    batchEditForms
      .filter((item) => !item.isDeleted)
      .reduce((sum, item) => sum + (item.weight || 0), 0);
  const addBatchItem = () => setBatchForms([...batchForms, emptyBatchItem()]);
  const removeBatchItem = (index: number) =>
    setBatchForms(batchForms.filter((_, i) => i !== index));
  const updateBatchItem = (index: number, field: string, value: any) => {
    const updated = [...batchForms];
    updated[index] = { ...updated[index], [field]: value };
    setBatchForms(updated);
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-[#111318]">
                Semester:
              </label>
              <select
                value={selectedSemesterId ?? ""}
                onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                disabled={semesters.length === 0}
              >
                {semesters.length === 0 ? (
                  <option value="">Loading semesters...</option>
                ) : (
                  semesters.map((semester) => (
                    <option
                      key={semester.semesterId}
                      value={semester.semesterId}
                    >
                      {semester.semesterName}
                      {semester.isActive && " (Active)"}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="flex items-center gap-3">
              {assessments.length === 0 && (
                <button
                  onClick={() => {
                    resetAssessmentForm();
                    setShowAssessmentModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#135bec] text-white rounded-lg hover:bg-[#0d4cbd] transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined">add</span>
                  <span>New Assessment</span>
                </button>
              )}
              {assessments.length > 0 && (
                <button
                  onClick={openBatchEditModal}
                  className="flex items-center gap-2 px-4 py-2 border border-[#135bec] text-[#135bec] rounded-lg hover:bg-[#f0f5ff] transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined">edit</span>
                  <span>Edit Assessments</span>
                </button>
              )}
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[#135bec] text-[#135bec] rounded-lg hover:bg-[#f0f5ff] transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined">cloud_upload</span>
                <span>Upload Template</span>
              </button>
            </div>
          </div>
        </div>
        {/* Templates Grid Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#111318] mb-1">
              Uploaded Templates
            </h3>
          </div>
          {templatesLoading ? (
            <div className="text-center py-4 text-[#616f89]">
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
              <span className="material-symbols-outlined text-4xl text-[#616f89] mb-2">
                folder_open
              </span>
              <p className="text-sm text-[#616f89]">
                No templates uploaded for this semester yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left align-middle border-collapse">
                <thead>
                  <tr className="border-b-[2px] border-[#dbdfe6] text-[#616f89] bg-[#f6f6f8]">
                    <th className="px-4 py-3 font-semibold w-1/2">
                      Template Name
                    </th>
                    <th className="px-4 py-3 font-semibold">Uploaded At</th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dbdfe6]">
                  {templates.map((tpl) => (
                    <tr
                      key={tpl.templateId}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="px-4 py-3 font-medium text-[#111318]">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-500 text-lg">
                            description
                          </span>
                          {tpl.templateName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#616f89]">
                        {tpl.createdAt
                          ? new Date(tpl.createdAt).toLocaleDateString("vi-VN")
                          : "--"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={tpl.templateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Download/View"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              download
                            </span>
                          </a>
                          <button
                            onClick={() => handleDeleteTemplate(tpl.templateId)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Weight Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#111318] mb-1">
                Total Weight
              </h3>
              <p className="text-sm text-[#616f89]">
                Must equal 100% for valid grading scheme
              </p>
            </div>
            <div className="text-right">
              <div
                className={`text-3xl font-bold ${getTotalWeight() === 100 ? "text-green-600" : "text-red-600"}`}
              >
                {getTotalWeight().toFixed(2)}%
              </div>
              <div className="text-sm text-[#616f89]">of 100%</div>
            </div>
          </div>
        </div>

        {/* Assessments Grid */}
        {loading && !assessments.length ? (
          <div className="text-center py-12 text-[#616f89]">Loading...</div>
        ) : assessments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-[#616f89] mb-4">
              assignment
            </span>
            <h3 className="text-xl font-semibold text-[#111318] mb-2">
              No Assessments Yet
            </h3>
            <p className="text-[#616f89] mb-6">
              Create your first assessment to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assessments.map((assessment) => (
              <div
                key={assessment.assessmentId}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-[#111318]">
                        {assessment.title}
                      </h3>
                      {assessment.isFinal && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                          FINAL
                        </span>
                      )}
                      {assessment.isLocked && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                          <span className="material-symbols-outlined text-sm leading-none">
                            lock
                          </span>
                          Locked
                        </span>
                      )}
                      {assessment.hasScores && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          <span className="material-symbols-outlined text-sm leading-none">
                            grading
                          </span>
                          Graded
                        </span>
                      )}
                      {assessment.hasSubmissions && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                          <span className="material-symbols-outlined text-sm leading-none">
                            upload_file
                          </span>
                          Has Submissions
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-[#135bec]">
                      {assessment.weight}%
                    </p>
                  </div>
                  <button
                    onClick={() => handleLockToggle(assessment)}
                    disabled={loading}
                    title={
                      assessment.isLocked
                        ? "Unlock this assessment"
                        : "Lock this assessment"
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      assessment.isLocked
                        ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base leading-none">
                      {assessment.isLocked ? "lock_open" : "lock"}
                    </span>
                    {assessment.isLocked ? "Unlock" : "Lock"}
                  </button>
                </div>

                {/* Dates & Description */}
                {(assessment.startDate ||
                  assessment.deadline ||
                  assessment.description) && (
                  <div className="mb-4 space-y-2 px-0">
                    {(assessment.startDate || assessment.deadline) && (
                      <div className="flex flex-wrap gap-4 text-sm text-[#616f89]">
                        {assessment.startDate && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                              calendar_today
                            </span>
                            Start:{" "}
                            {new Date(assessment.startDate).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        )}
                        {assessment.deadline && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                              event
                            </span>
                            Deadline:{" "}
                            {new Date(assessment.deadline).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        )}
                      </div>
                    )}
                    {assessment.description && (
                      <p className="text-sm text-[#616f89] italic line-clamp-2">
                        {assessment.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Criteria Section */}
                <div className="border-t pt-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-[#111318]">
                      Criteria ({assessment.criteria?.length || 0})
                    </h4>
                    <div
                      className={`text-sm font-medium ${assessment.isValid ? "text-green-600" : "text-red-600"}`}
                    >
                      {assessment.totalCriteriaWeight.toFixed(2)}%
                    </div>
                  </div>
                  {assessment.criteria && assessment.criteria.length > 0 ? (
                    <div className="space-y-2">
                      {assessment.criteria.map((criterion) => (
                        <div
                          key={criterion.criteriaId}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-[#111318]">
                            {criterion.criteriaName}
                          </span>
                          <span className="text-sm font-medium text-[#616f89]">
                            {criterion.weight}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#616f89] italic">
                      No criteria defined
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openCriteriaModal(assessment)}
                    disabled={
                      assessment.isLocked || assessment.hasScores || loading
                    }
                    title={
                      assessment.hasScores
                        ? "Cannot edit criteria: scores have already been recorded"
                        : assessment.isLocked
                          ? "Cannot edit criteria: assessment is locked"
                          : undefined
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#135bec] text-white rounded-lg hover:bg-[#0d4cbd] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                  >
                    <span className="material-symbols-outlined text-base">
                      edit
                    </span>
                    <span>Edit Criteria</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assessment Modal */}
      {showAssessmentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#111318] mb-4">
              Create Assessments
            </h2>

            {/* ── Batch create assessments ── */}
            <form onSubmit={handleBatchCreateAssessments}>
              <p className="text-sm text-[#616f89] mb-4">
                Add all assessments for this semester. Total weight must equal
                exactly 100%.
              </p>

              <div className="space-y-3 mb-4">
                {batchForms.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2"
                  >
                    {/* Row 1: index, title, weight, delete */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-6 shrink-0">
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Assessment title *"
                        value={item.title}
                        onChange={(e) =>
                          updateBatchItem(index, "title", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                        required
                        maxLength={200}
                      />
                      <input
                        type="number"
                        placeholder="Weight %"
                        step="0.01"
                        min="0.01"
                        max="100"
                        value={item.weight || ""}
                        onChange={(e) =>
                          updateBatchItem(
                            index,
                            "weight",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeBatchItem(index)}
                        disabled={batchForms.length === 1}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-base">
                          delete
                        </span>
                      </button>
                    </div>
                    {/* Row 2: isFinal, start date, deadline */}
                    <div className="flex items-center gap-3 pl-8 flex-wrap">
                      <label className="flex items-center gap-1.5 text-sm text-[#111318] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isFinal}
                          onChange={(e) =>
                            updateBatchItem(index, "isFinal", e.target.checked)
                          }
                          className="w-4 h-4 text-[#135bec] border-gray-300 rounded focus:ring-[#135bec]"
                        />
                        Final
                      </label>
                      <input
                        type="datetime-local"
                        value={item.startDate || ""}
                        min={todayDateTimeLocal()}
                        onChange={(e) =>
                          updateBatchItem(index, "startDate", e.target.value)
                        }
                        className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#135bec]"
                        title="Start Date"
                      />
                      <input
                        type="datetime-local"
                        value={item.deadline || ""}
                        min={todayDateTimeLocal()}
                        onChange={(e) =>
                          updateBatchItem(index, "deadline", e.target.value)
                        }
                        className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#135bec]"
                        title="Deadline"
                      />
                    </div>
                    {/* Row 3: description */}
                    <div className="pl-8">
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={item.description || ""}
                        onChange={(e) =>
                          updateBatchItem(index, "description", e.target.value)
                        }
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#135bec]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addBatchItem}
                className="flex items-center gap-2 px-4 py-2 border border-[#135bec] text-[#135bec] rounded-lg hover:bg-[#f0f5ff] transition-colors mb-4 text-sm"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Add Assessment
              </button>

              {/* Total weight */}
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#111318]">
                    Total Weight:
                  </span>
                  <span
                    className={`text-xl font-bold ${getBatchTotalWeight() === 100 ? "text-green-600" : "text-red-600"}`}
                  >
                    {getBatchTotalWeight().toFixed(2)}%
                  </span>
                </div>
                {getBatchTotalWeight() !== 100 && (
                  <p className="text-xs text-red-600 mt-1">
                    Total must be exactly 100%. Currently{" "}
                    {getBatchTotalWeight() > 100 ? "over by" : "under by"}{" "}
                    {Math.abs(100 - getBatchTotalWeight()).toFixed(2)}%.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssessmentModal(false);
                    setBatchForms([emptyBatchItem()]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-[#616f89] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || getBatchTotalWeight() !== 100}
                  className="flex-1 px-4 py-2 bg-[#135bec] text-white rounded-lg hover:bg-[#0d4cbd] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create All"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Edit Modal */}
      {showBatchEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#111318] mb-4">
              Edit Assessments
            </h2>
            <form onSubmit={handleBatchUpdateAssessments}>
              <p className="text-sm text-[#616f89] mb-4">
                Edit all unlocked assessments. Total weight must equal exactly
                100%. Locked assessments cannot be modified.
              </p>
              <div className="space-y-3 mb-4">
                {batchEditForms
                  .filter((item) => !item.isDeleted)
                  .map((item, _idx) => {
                    const realIndex = batchEditForms.indexOf(item);
                    return (
                      <div
                        key={item.assessmentId ?? `new-${realIndex}`}
                        className={`border rounded-lg p-3 space-y-2 ${
                          item.isLocked || item.hasScores
                            ? "bg-gray-100 border-gray-300 opacity-75"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        {/* Row 1: index, title, weight, locked badge, delete/remove */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 w-6 shrink-0">
                            #{_idx + 1}
                          </span>
                          <input
                            type="text"
                            placeholder="Assessment title *"
                            value={item.title}
                            onChange={(e) =>
                              !item.isLocked &&
                              !item.hasScores &&
                              updateBatchEditItem(
                                realIndex,
                                "title",
                                e.target.value,
                              )
                            }
                            disabled={item.isLocked || item.hasScores}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#135bec] disabled:bg-gray-200 disabled:cursor-not-allowed"
                            required
                            maxLength={200}
                          />
                          <input
                            type="number"
                            placeholder="Weight %"
                            step="0.01"
                            min="0.01"
                            max="100"
                            value={item.weight || ""}
                            onChange={(e) =>
                              !item.isLocked &&
                              !item.hasScores &&
                              updateBatchEditItem(
                                realIndex,
                                "weight",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            disabled={item.isLocked || item.hasScores}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#135bec] disabled:bg-gray-200 disabled:cursor-not-allowed"
                            required
                          />
                          {item.isLocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                              <span className="material-symbols-outlined text-sm leading-none">
                                lock
                              </span>
                              Locked
                            </span>
                          ) : item.hasScores ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                              <span className="material-symbols-outlined text-sm leading-none">
                                grading
                              </span>
                              Graded
                            </span>
                          ) : item.isNew ? (
                            <button
                              type="button"
                              onClick={() => removeBatchEditItem(realIndex)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Remove"
                            >
                              <span className="material-symbols-outlined text-base">
                                close
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteFromBatchEdit(realIndex, item.title)
                              }
                              disabled={item.hasSubmissions || loading}
                              title={
                                item.hasSubmissions
                                  ? "Cannot delete: students have already submitted"
                                  : "Delete assessment"
                              }
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                            >
                              <span className="material-symbols-outlined text-base">
                                delete
                              </span>
                            </button>
                          )}
                        </div>
                        {/* Row 2: isFinal, start date, deadline */}
                        {!item.isLocked && !item.hasScores && (
                          <>
                            <div className="flex items-center gap-3 pl-8 flex-wrap">
                              <label className="flex items-center gap-1.5 text-sm text-[#111318] cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={item.isFinal}
                                  onChange={(e) =>
                                    updateBatchEditItem(
                                      realIndex,
                                      "isFinal",
                                      e.target.checked,
                                    )
                                  }
                                  className="w-4 h-4 text-[#135bec] border-gray-300 rounded focus:ring-[#135bec]"
                                />
                                Final
                              </label>
                              <input
                                type="datetime-local"
                                value={item.startDate || ""}
                                min={todayDateTimeLocal()}
                                onChange={(e) =>
                                  updateBatchEditItem(
                                    realIndex,
                                    "startDate",
                                    e.target.value,
                                  )
                                }
                                className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#135bec]"
                                title="Start Date"
                              />
                              <input
                                type="datetime-local"
                                value={item.deadline || ""}
                                min={todayDateTimeLocal()}
                                onChange={(e) =>
                                  updateBatchEditItem(
                                    realIndex,
                                    "deadline",
                                    e.target.value,
                                  )
                                }
                                className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#135bec]"
                                title="Deadline"
                              />
                            </div>
                            {/* Row 3: description */}
                            <div className="pl-8">
                              <input
                                type="text"
                                placeholder="Description (optional)"
                                value={item.description || ""}
                                onChange={(e) =>
                                  updateBatchEditItem(
                                    realIndex,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#135bec]"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={addBatchEditItem}
                className="flex items-center gap-2 px-4 py-2 border border-[#135bec] text-[#135bec] rounded-lg hover:bg-[#f0f5ff] transition-colors mb-4 text-sm"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Add Assessment
              </button>

              {/* Total weight */}
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#111318]">
                    Total Weight:
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      getBatchEditTotalWeight() === 100
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {getBatchEditTotalWeight().toFixed(2)}%
                  </span>
                </div>
                {getBatchEditTotalWeight() !== 100 && (
                  <p className="text-xs text-red-600 mt-1">
                    Total must be exactly 100%. Currently{" "}
                    {getBatchEditTotalWeight() > 100 ? "over by" : "under by"}{" "}
                    {Math.abs(100 - getBatchEditTotalWeight()).toFixed(2)}%.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBatchEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-[#616f89] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || getBatchEditTotalWeight() !== 100}
                  className="flex-1 px-4 py-2 bg-[#135bec] text-white rounded-lg hover:bg-[#0d4cbd] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Save All"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Criteria Modal */}
      {showCriteriaModal && selectedAssessment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#111318] mb-2">
              Edit Criteria - {selectedAssessment.title}
            </h2>
            <p className="text-sm text-[#616f89] mb-4">
              Define assignment criteria. Total weight must equal 100%
            </p>
            <form onSubmit={handleSaveCriteria}>
              <div className="space-y-3 mb-4">
                {criteriaList.map((criterion, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={criterion.criteriaName}
                        onChange={(e) =>
                          updateCriterion(index, "criteriaName", e.target.value)
                        }
                        placeholder="Criteria name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                        required
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="100"
                        value={criterion.weight || ""}
                        onChange={(e) =>
                          updateCriterion(
                            index,
                            "weight",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="Weight %"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCriterion(index)}
                      disabled={criteriaList.length === 1}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addCriterion}
                className="flex items-center gap-2 px-4 py-2 border border-[#135bec] text-[#135bec] rounded-lg hover:bg-[#f0f5ff] transition-colors mb-4"
              >
                <span className="material-symbols-outlined">add</span>
                <span>Add Criterion</span>
              </button>

              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#111318]">
                    Total Weight:
                  </span>
                  <span
                    className={`text-lg font-bold ${getCriteriaTotalWeight() === 100 ? "text-green-600" : "text-red-600"}`}
                  >
                    {getCriteriaTotalWeight().toFixed(2)}%
                  </span>
                </div>
                {getCriteriaTotalWeight() !== 100 && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-base">
                        warning
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800">
                          Invalid Weight Distribution
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Total criteria weight must equal 100%. Currently{" "}
                          {getCriteriaTotalWeight().toFixed(2)}%.
                          {getCriteriaTotalWeight() > 100
                            ? " Reduce by "
                            : " Add "}
                          {Math.abs(100 - getCriteriaTotalWeight()).toFixed(2)}
                          %.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCriteriaModal(false);
                    setCriteriaList([{ criteriaName: "", weight: 0 }]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-[#616f89] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || getCriteriaTotalWeight() !== 100}
                  className="flex-1 px-4 py-2 bg-[#135bec] text-white rounded-lg hover:bg-[#0d4cbd] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Save Criteria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Template Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">
                  cloud_upload
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#111318]">
                  Upload Report Template
                </h2>
                <p className="text-sm text-[#616f89]">
                  Tải lên tài liệu mẫu cho môn học SWP391
                </p>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#616f89] uppercase tracking-wider mb-2">
                  Tên tài liệu
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Mẫu báo cáo Iteration 1 (SRS)"
                  className="w-full px-4 py-3 bg-[#f6f6f8] border border-[#dbdfe6] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  value={templateForm.title}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#616f89] uppercase tracking-wider mb-2">
                  Chọn File (.zip, .rar, .7z)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    className="hidden"
                    id="template-file-upload"
                    accept=".zip,.rar,.7z"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        const extension = file.name
                          .split(".")
                          .pop()
                          ?.toLowerCase();
                        if (!["zip", "rar", "7z"].includes(extension || "")) {
                          setError(
                            "Vui lòng chỉ tải lên các loại file nén (.zip, .rar, .7z)",
                          );
                          return;
                        }
                        setError("");
                        setTemplateForm({ ...templateForm, file });
                      }
                    }}
                  />
                  <label
                    htmlFor="template-file-upload"
                    className="w-full px-4 py-3 bg-[#f6f6f8] border border-dashed border-[#dbdfe6] rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all"
                  >
                    <span className="text-sm text-gray-500 truncate">
                      {templateForm.file
                        ? templateForm.file.name
                        : "Kéo thả hoặc click để chọn file"}
                    </span>
                    <span className="material-symbols-outlined text-gray-400">
                      attach_file
                    </span>
                  </label>
                </div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-amber-500">
                    info
                  </span>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                    Tài liệu này sẽ được hiển thị cho tất cả sinh viên thuộc Học
                    kỳ đang chọn (
                    <b>
                      {
                        semesters.find(
                          (s) => s.semesterId === selectedSemesterId,
                        )?.semesterName
                      }
                    </b>
                    ) trong trang <b>Progress Report</b>.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-3 border border-[#dbdfe6] text-[#616f89] font-bold rounded-xl hover:bg-[#f6f6f8] transition-all"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300"
                disabled={loading || !templateForm.title || !templateForm.file}
                onClick={async () => {
                  if (!selectedSemesterId || !templateForm.file) return;
                  const fileExtension = templateForm.file.name
                    .split(".")
                    .pop()
                    ?.toLowerCase();
                  if (!["zip", "rar", "7z"].includes(fileExtension || "")) {
                    setError(
                      "Chỉ chấp nhận các định dạng file nén: .zip, .rar, .7z",
                    );
                    return;
                  }
                  const formData = new FormData();
                  formData.append("TemplateName", templateForm.title);
                  formData.append("SemesterId", selectedSemesterId.toString());
                  formData.append("File", templateForm.file);
                  setLoading(true);
                  try {
                    const response = await api.post(
                      "/api/ProjectTemplate/upload",
                      formData,
                      {
                        headers: { "Content-Type": "multipart/form-data" },
                      },
                    );
                    if (response.data.success) {
                      setSuccess("Tải lên tài liệu mẫu thành công!");
                      setShowUploadModal(false);
                      setTemplateForm({ title: "", file: null });
                      loadTemplates();
                    }
                  } catch (err: any) {
                    setError(
                      err.response?.data?.message || "Lỗi khi tải lên tài liệu",
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">
                    sync
                  </span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">
                      check_circle
                    </span>
                    Xác nhận
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[70]">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  confirmDialog.variant === "danger"
                    ? "bg-red-100"
                    : "bg-amber-100"
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    confirmDialog.variant === "danger"
                      ? "text-red-600"
                      : "text-amber-600"
                  }`}
                >
                  {confirmDialog.variant === "danger" ? "delete" : "warning"}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111318] mb-1">
                  {confirmDialog.title}
                </h3>
                <p className="text-sm text-[#616f89] whitespace-pre-line">
                  {confirmDialog.body}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmDialog(null)}
                disabled={confirmLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-[#616f89] rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setConfirmLoading(true);
                  await confirmDialog.onConfirm();
                  setConfirmLoading(false);
                  setConfirmDialog(null);
                }}
                disabled={confirmLoading}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  confirmDialog.variant === "danger"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-amber-500 text-white hover:bg-amber-600"
                }`}
              >
                {confirmLoading ? "Processing..." : confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssessmentManagementContent;
