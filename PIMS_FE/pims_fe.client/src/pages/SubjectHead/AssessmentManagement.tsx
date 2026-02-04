import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
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
  CreateAssessmentDto,
  UpdateAssessmentDto,
  CreateCriterionDto,
} from "../../types/assessment.types";

const AssessmentManagement: React.FC = () => {
  const { user } = useAuth();
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
  const [editingAssessment, setEditingAssessment] =
    useState<AssessmentWithCriteriaDto | null>(null);
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentWithCriteriaDto | null>(null);

  // Template Upload states (Placeholder)
  // Template Upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [templateForm, setTemplateForm] = useState<{ title: string; file: File | null }>({ title: "", file: null });

  // Form states
  const [assessmentForm, setAssessmentForm] = useState<CreateAssessmentDto>({
    semesterId: selectedSemesterId ?? 0,
    title: "",
    weight: 0,
    isFinal: false,
  });

  useEffect(() => {
    if (selectedSemesterId !== null) {
      setAssessmentForm((prev) => ({
        ...prev,
        semesterId: selectedSemesterId,
      }));
    }
  }, [selectedSemesterId]);

  const [criteriaList, setCriteriaList] = useState<CreateCriterionDto[]>([
    { criteriaName: "", weight: 0 },
  ]);

  useEffect(() => {
    loadSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemesterId !== null) {
      loadAssessments();
    }
  }, [selectedSemesterId]);

  const loadSemesters = async () => {
    try {
      const response = await semesterService.getAllSemesters();
      setSemesters(response.data);
      // Set active semester as default or first semester
      const activeSemester = response.data.find((s) => s.isActive);
      if (activeSemester) {
        setSelectedSemesterId(activeSemester.semesterId);
      } else if (response.data.length > 0) {
        setSelectedSemesterId(response.data[0].semesterId);
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

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await assessmentService.createAssessment(assessmentForm);
      setSuccess("Assessment created successfully");
      setShowAssessmentModal(false);
      resetAssessmentForm();
      loadAssessments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssessment) return;
    setLoading(true);
    setError("");
    try {
      const updateDto: UpdateAssessmentDto = {
        title: assessmentForm.title,
        weight: assessmentForm.weight,
        isFinal: assessmentForm.isFinal,
      };
      await assessmentService.updateAssessment(
        editingAssessment.assessmentId,
        updateDto,
      );
      setSuccess("Assessment updated successfully");
      setShowAssessmentModal(false);
      resetAssessmentForm();
      loadAssessments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssessment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;
    setLoading(true);
    setError("");
    try {
      await assessmentService.deleteAssessment(id);
      setSuccess("Assessment deleted successfully");
      loadAssessments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleLockToggle = async (assessment: AssessmentWithCriteriaDto) => {
    // Confirmation for unlock action
    if (assessment.isLocked) {
      const confirmed = confirm(
        "Are you sure you want to unlock this assessment?\n\n" +
        "Note: You cannot unlock if scores have already been recorded.\n" +
        "Unlocking allows modifications to criteria and weights.",
      );
      if (!confirmed) return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (assessment.isLocked) {
        await assessmentService.unlockAssessment(assessment.assessmentId);
        setSuccess(
          "✅ Assessment unlocked successfully. You can now edit criteria and weights.",
        );
      } else {
        await assessmentService.lockAssessment(assessment.assessmentId);
        setSuccess(
          "🔒 Assessment locked successfully. No further modifications allowed.",
        );
      }
      loadAssessments();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to toggle lock";
      setError(errorMessage);

      // Auto-clear error after 8 seconds for better UX
      setTimeout(() => setError(""), 8000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      console.log("Saving criteria:", {
        assessmentId: selectedAssessment.assessmentId,
        criteria: criteriaList,
      });
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
      console.error("Failed to save criteria:", err);
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
    setAssessmentForm({
      semesterId: selectedSemesterId ?? 0,
      title: "",
      weight: 0,
      isFinal: false,
    });
    setEditingAssessment(null);
  };

  const openEditModal = (assessment: AssessmentWithCriteriaDto) => {
    setEditingAssessment(assessment);
    setAssessmentForm({
      semesterId: assessment.semesterId,
      title: assessment.title,
      weight: assessment.weight,
      isFinal: assessment.isFinal,
    });
    setShowAssessmentModal(true);
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

  const addCriterion = () => {
    setCriteriaList([...criteriaList, { criteriaName: "", weight: 0 }]);
  };

  const removeCriterion = (index: number) => {
    setCriteriaList(criteriaList.filter((_, i) => i !== index));
  };

  const updateCriterion = (
    index: number,
    field: keyof CreateCriterionDto,
    value: any,
  ) => {
    const updated = [...criteriaList];
    updated[index] = { ...updated[index], [field]: value };
    setCriteriaList(updated);
  };

  const getTotalWeight = () => {
    return assessments.reduce((sum, a) => sum + a.weight, 0);
  };

  const getCriteriaTotalWeight = () => {
    return criteriaList.reduce((sum, c) => sum + c.weight, 0);
  };

  const getNewTotalWeight = () => {
    const currentWeight = assessmentForm.weight || 0;
    const otherAssessmentsWeight = assessments
      .filter((a) =>
        editingAssessment
          ? a.assessmentId !== editingAssessment.assessmentId
          : true,
      )
      .reduce((sum, a) => sum + a.weight, 0);
    return currentWeight + otherAssessmentsWeight;
  };

  return (
    <div className="flex min-h-screen bg-[#f6f6f8] text-[#111318] font-display">
      {/* Side Navigation */}
      <aside className="w-64 border-r border-[#dbdfe6] bg-white flex flex-col fixed h-full z-20">
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">
                school
              </span>
            </div>
            <div>
              <h1 className="text-[#111318] text-base font-bold leading-none">
                PIMS Dashboard
              </h1>
              <p className="text-[#616f89] text-xs mt-1">Head of Subject</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#616f89] hover:bg-[#f6f6f8] transition-colors"
              href="/subject-head/dashboard"
            >
              <span className="material-symbols-outlined text-[22px]">
                dashboard
              </span>
              <span className="text-sm">Subject Overview</span>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#616f89] hover:bg-[#f6f6f8] transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-[22px]">
                groups
              </span>
              <span className="text-sm">Faculty Management</span>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium"
              href="/subject-head/assessments"
            >
              <span className="material-symbols-outlined text-[22px]">
                menu_book
              </span>
              <span className="text-sm">Syllabus &amp; Assessment</span>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#616f89] hover:bg-[#f6f6f8] transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-[22px]">
                bar_chart
              </span>
              <span className="text-sm">Performance Analytics</span>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#616f89] hover:bg-[#f6f6f8] transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-[22px]">
                verified_user
              </span>
              <span className="text-sm">Quality Audit</span>
            </a>
          </nav>
        </div>
        <div className="mt-auto p-4 flex flex-col gap-4">
          <div className="bg-[#f6f6f8] p-4 rounded-xl flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCfEreAXEz26Ko6praZ0G1SFeoRfgXQpL4VTkmzK2IKAgJraHpEKQxZ03RbhY5RybSTS0efxBPDoRioCZBjR9Bhg4FKXhr9tsCzRo33uYGd9dzL-e_t3uZaWAvw58J60yT3DlhYVumJvOHykWthGg-NAhgWDZTokUCADmvpr8un1se23K8P_cDwEeIByhu4Kb2nQSD_pYn583FPPqGB1Kpn6ys648um_g4OJCuzF6FQjUII0odVNl3xmgFaJIpRsI_N190xvtijcyNK')",
              }}
            ></div>
            <div>
              <p className="text-xs font-bold text-[#111318]">
                {user?.fullName || "Subject Head"}
              </p>
              <p className="text-[10px] text-[#616f89]">Senior Lecturer</p>
            </div>
          </div>
          <button className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-primary/90 transition-all">
            <span className="material-symbols-outlined text-sm">download</span>
            Export Reports
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#111318] mb-2">
              Assessment Management
            </h1>
            <p className="text-[#616f89]">
              Manage grading schemes and assignment criteria
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Actions Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-[#111318]">
                  Semester:
                </label>
                <select
                  value={selectedSemesterId ?? ""}
                  onChange={(e) =>
                    setSelectedSemesterId(Number(e.target.value))
                  }
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

          {/* Weight Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
                  className={`text-3xl font-bold ${getTotalWeight() === 100 ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {getTotalWeight().toFixed(2)}%
                </div>
                <div className="text-sm text-[#616f89]">of 100%</div>
              </div>
            </div>
            {getTotalWeight() !== 100 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                <span className="material-symbols-outlined text-base mr-2 align-middle">
                  warning
                </span>
                Total weight must equal 100% before locking assessments
              </div>
            )}
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
                          <span className="material-symbols-outlined text-red-600 text-xl">
                            lock
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-[#135bec]">
                        {assessment.weight}%
                      </p>
                    </div>
                    <button
                      onClick={() => handleLockToggle(assessment)}
                      className={`p-2 rounded-lg transition-colors ${assessment.isLocked
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      disabled={loading}
                    >
                      <span className="material-symbols-outlined">
                        {assessment.isLocked ? "lock" : "lock_open"}
                      </span>
                    </button>
                  </div>

                  {/* Criteria Section */}
                  <div className="border-t pt-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-[#111318]">
                        Criteria ({assessment.criteria?.length || 0})
                      </h4>
                      <div
                        className={`text-sm font-medium ${assessment.isValid ? "text-green-600" : "text-red-600"
                          }`}
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
                      disabled={assessment.isLocked || loading}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#135bec] text-white rounded-lg hover:bg-[#0d4cbd] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                      <span className="material-symbols-outlined text-base">
                        edit
                      </span>
                      <span>Edit Criteria</span>
                    </button>
                    <button
                      onClick={() => openEditModal(assessment)}
                      disabled={assessment.isLocked || loading}
                      className="px-3 py-2 border border-[#135bec] text-[#135bec] rounded-lg hover:bg-[#f0f5ff] transition-colors disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-base">
                        edit
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteAssessment(assessment.assessmentId)
                      }
                      disabled={assessment.isLocked || loading}
                      className="px-3 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-base">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main >

      {/* Assessment Modal */}
      {
        showAssessmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-[#111318] mb-4">
                {editingAssessment ? "Edit Assessment" : "Create Assessment"}
              </h2>
              <form
                onSubmit={
                  editingAssessment
                    ? handleUpdateAssessment
                    : handleCreateAssessment
                }
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#111318] mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={assessmentForm.title}
                      onChange={(e) =>
                        setAssessmentForm({
                          ...assessmentForm,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                      required
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111318] mb-1">
                      Weight (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="100"
                      value={assessmentForm.weight}
                      onChange={(e) =>
                        setAssessmentForm({
                          ...assessmentForm,
                          weight: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                      required
                    />
                    {assessmentForm.weight > 0 && getNewTotalWeight() !== 100 && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-amber-600 text-base">
                            warning
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-amber-800">
                              Total weight will be{" "}
                              {getNewTotalWeight().toFixed(2)}%
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              All assessments must total exactly 100%.{" "}
                              {getNewTotalWeight() > 100 ? "Reduce" : "Increase"}{" "}
                              the weight to reach 100%.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFinal"
                      checked={assessmentForm.isFinal}
                      onChange={(e) =>
                        setAssessmentForm({
                          ...assessmentForm,
                          isFinal: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[#135bec] border-gray-300 rounded focus:ring-[#135bec]"
                    />
                    <label htmlFor="isFinal" className="text-sm text-[#111318]">
                      Mark as Final Assessment
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssessmentModal(false);
                      resetAssessmentForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-[#616f89] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || getNewTotalWeight() !== 100}
                    className="flex-1 px-4 py-2 bg-[#135bec] text-white rounded-lg hover:bg-[#0d4cbd] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Saving..."
                      : editingAssessment
                        ? "Update"
                        : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Criteria Modal */}
      {
        showCriteriaModal && selectedAssessment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                          value={criterion.weight}
                          onChange={(e) =>
                            updateCriterion(
                              index,
                              "weight",
                              Number(e.target.value),
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
                      className={`text-lg font-bold ${getCriteriaTotalWeight() === 100
                        ? "text-green-600"
                        : "text-red-600"
                        }`}
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
        )
      }

      {/* Upload Template Modal */}
      {
        showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#111318]">Upload Report Template</h2>
                  <p className="text-sm text-[#616f89]">Tải lên tài liệu mẫu cho môn học SWP391</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#616f89] uppercase tracking-wider mb-2">Tên tài liệu</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Mẫu báo cáo Iteration 1 (SRS)"
                    className="w-full px-4 py-3 bg-[#f6f6f8] border border-[#dbdfe6] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#616f89] uppercase tracking-wider mb-2">Chọn File (.zip, .rar, .7z)</label>
                  <div className="relative">
                    <input
                      type="file"
                      className="hidden"
                      id="template-file-upload"
                      accept=".zip,.rar,.7z"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          const extension = file.name.split('.').pop()?.toLowerCase();
                          if (!['zip', 'rar', '7z'].includes(extension || "")) {
                            setError("Vui lòng chỉ tải lên các loại file nén (.zip, .rar, .7z)");
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
                        {templateForm.file ? templateForm.file.name : "Kéo thả hoặc click để chọn file"}
                      </span>
                      <span className="material-symbols-outlined text-gray-400">attach_file</span>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-amber-500">info</span>
                    <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                      Tài liệu này sẽ được hiển thị cho tất cả sinh viên thuộc Học kỳ đang chọn (<b>{semesters.find(s => s.semesterId === selectedSemesterId)?.semesterName}</b>) trong trang <b>Progress Report</b>.
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

                    const fileExtension = templateForm.file.name.split('.').pop()?.toLowerCase();
                    if (!['zip', 'rar', '7z'].includes(fileExtension || "")) {
                      setError("Chỉ chấp nhận các định dạng file nén: .zip, .rar, .7z");
                      return;
                    }

                    const formData = new FormData();
                    formData.append("TemplateName", templateForm.title);
                    formData.append("SemesterId", selectedSemesterId.toString());
                    formData.append("File", templateForm.file);

                    setLoading(true);
                    try {
                      const response = await api.post("/api/ProjectTemplate/upload", formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                      });
                      if (response.data.success) {
                        setSuccess("Tải lên tài liệu mẫu thành công!");
                        setShowUploadModal(false);
                        setTemplateForm({ title: "", file: null });
                      }
                    } catch (err: any) {
                      setError(err.response?.data?.message || "Lỗi khi tải lên tài liệu");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">sync</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">check_circle</span>
                      Xác nhận
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default AssessmentManagement;
