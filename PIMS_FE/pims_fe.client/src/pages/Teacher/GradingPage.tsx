import React, { useState, useEffect } from "react";
import TeacherSidebar from "../../components/teacher/TeacherSidebar";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import { assessmentService } from "../../services/assessmentService";
import type { AssessmentWithCriteriaDto } from "../../types/assessment.types";

const GradingPage: React.FC = () => {
    const [assessments, setAssessments] = useState<AssessmentWithCriteriaDto[]>([]);
    const [selectedAssessment, setSelectedAssessment] = useState<AssessmentWithCriteriaDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                // Assuming semesterId 1 for now, should be dynamic
                const response = await assessmentService.getAssessmentsWithCriteria(1);
                const data = response.data;
                setAssessments(data);
                if (data.length > 0) setSelectedAssessment(data[0]);
            } catch (error) {
                console.error("Failed to fetch assessments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssessments();
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-[#f6f6f8] text-[#111318] font-display">
            <TeacherSidebar currentPath="/teacher/grading" />

            <main className="flex-1 overflow-y-auto bg-[#f6f6f8]">
                <TeacherHeader
                    title="Student Grading"
                    subtitle="Evaluate student performance based on assessment criteria."
                />

                <div className="p-8 max-w-[1200px] mx-auto space-y-8">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            {/* Assessment Selection */}
                            <section className="bg-white rounded-xl border border-[#dbdfe6] p-6 shadow-sm">
                                <h3 className="text-lg font-bold mb-4">Select Assessment</h3>
                                <div className="flex flex-wrap gap-3">
                                    {assessments.map((a) => (
                                        <button
                                            key={a.assessmentId}
                                            onClick={() => setSelectedAssessment(a)}
                                            className={`px-4 py-2 rounded-lg border transition-all ${selectedAssessment?.assessmentId === a.assessmentId
                                                ? "bg-primary border-primary text-white"
                                                : "bg-white border-[#dbdfe6] text-[#616f89] hover:border-primary hover:text-primary"
                                                }`}
                                        >
                                            {a.title} ({a.weight}%)
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Grading Table Placeholder */}
                            <section className="bg-white rounded-xl border border-[#dbdfe6] shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-[#dbdfe6]">
                                    <h3 className="text-xl font-bold">{selectedAssessment?.title} - Grading</h3>
                                    <p className="text-sm text-[#616f89] mt-1">
                                        Criteria: {selectedAssessment?.criteria?.map(c => `${c.criteriaName} (${c.weight}%)`).join(", ")}
                                    </p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-[#dbdfe6]">
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Student Name</th>
                                                {selectedAssessment?.criteria?.map(c => (
                                                    <th key={c.criteriaId} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">
                                                        {c.criteriaName} ({c.weight}%)
                                                    </th>
                                                ))}
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Total Score</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#dbdfe6]">
                                            {/* In a real app, you'd map over groups/students here */}
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-semibold">Elena Rodriguez (G-205)</td>
                                                {selectedAssessment?.criteria?.map((c: any) => (
                                                    <td key={c.criteriaId} className="px-6 py-4 text-center">
                                                        <input
                                                            type="number"
                                                            max="10"
                                                            min="0"
                                                            placeholder="0-10"
                                                            className="w-16 px-2 py-1 border border-[#dbdfe6] rounded text-center text-sm focus:ring-1 focus:ring-primary outline-none"
                                                        />
                                                    </td>
                                                ))}
                                                <td className="px-6 py-4 text-right font-bold text-primary">--</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-semibold">Marcus Aurelius (G-201)</td>
                                                {selectedAssessment?.criteria?.map((c: any) => (
                                                    <td key={c.criteriaId} className="px-6 py-4 text-center">
                                                        <input
                                                            type="number"
                                                            max="10"
                                                            min="0"
                                                            className="w-16 px-2 py-1 border border-[#dbdfe6] rounded text-center text-sm focus:ring-1 focus:ring-primary outline-none"
                                                        />
                                                    </td>
                                                ))}
                                                <td className="px-6 py-4 text-right font-bold text-primary">--</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-6 bg-gray-50 border-t border-[#dbdfe6] flex justify-end">
                                    <button className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md">
                                        Save All Grades
                                    </button>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default GradingPage;
