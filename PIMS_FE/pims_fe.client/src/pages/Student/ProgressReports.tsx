import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
    CloudUpload,
    Info,
    Loader2,
    SendHorizontal,
    Clock,
    User,
    AlertCircle,
    Download,
    History,
    Trash2,
    Edit3,
    X
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useGroup } from '../../hooks/useGroup';
interface AssessmentDTO {
    assessmentId: number;
    title: string;
    deadline: string | null;
    description: string | null;
}

interface TemplateDTO {
    templateId: number;
    templateName: string;
    templateUrl: string;
    fileResourceId: string;
    createdAt: string;
}
const ProgressReports = () => {
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [assessments, setAssessments] = useState<AssessmentDTO[]>([]);
    const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);
    const [editingSubmissionId, setEditingSubmissionId] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [iteration, setIteration] = useState('');
    const [projectInfo, setProjectInfo] = useState<{ projectId: number; title: string } | null>(null);
    const [currentDate] = useState(new Date());
    const [activeSemester, setActiveSemester] = useState<{ id: number; name: string } | null>(null);


    const { user } = useAuth();
    const { hasGroup, groupLoading } = useGroup();

    const [userStatus] = useState({
        studentName: user?.fullName || "Student",
        mssv: user?.email?.split('@')[0].toUpperCase() || "N/A"
    });


    const [templates, setTemplates] = useState<TemplateDTO[]>([]);



    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'application/x-zip-compressed': ['.zip'], 'application/x-rar-compressed': ['.rar'], 'application/x-7z-compressed': ['.7z'] },
        multiple: false,
        disabled: !hasGroup || loading,
        onDrop: (acceptedFiles) => {
            setSelectedFile(acceptedFiles[0]);
            toast.success(`Đã chọn: ${acceptedFiles[0].name}`);
        }
    });

    const handleSubmit = async () => {
        // 1. Basic input validation
        if (!iteration || !selectedFile) {
            toast.error('Please select an Iteration and attach a file!');
            return;
        }

        const formData = new FormData();
        formData.append("ReportFile", selectedFile);
        formData.append("AssessmentId", iteration);
        if (projectInfo) {
            formData.append("ProjectId", String(projectInfo.projectId));
        }

        setLoading(true);
        setUploadProgress(0);

        const isEdit = editingSubmissionId !== null;
        const endpoint = isEdit ? `/api/Submission/update-report/${editingSubmissionId}` : `/api/Submission/submit-report`;

        try {
            const response = await api({
                method: isEdit ? 'put' : 'post',
                url: endpoint,
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percentCompleted);
                }
            });

            if (response.status === 200 || response.data.success) {
                toast.success(isEdit ? 'Updated successfully!' : 'Report submitted successfully!');
                resetForm();
                fetchSubmissionHistory();
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            if (errorMsg.includes('FK_Submission_Project')) {
                toast.error('Error: Your group is not assigned to a project!');
            } else {
                toast.error('Submission error: ' + errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setIteration('');
        setEditingSubmissionId(null);
        setUploadProgress(0);
    };

    const fetchSubmissionHistory = async () => {
        try {
            const response = await api.get('/api/Submission/history');
            if (response.data.success) {
                setSubmissionHistory(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    const handleWithdraw = async (submissionId: number) => {
        if (!window.confirm("Are you sure you want to withdraw this submission?")) return;

        try {
            const response = await api.delete(`/api/Submission/withdraw-report/${submissionId}`);
            if (response.data.success) {
                toast.success("Submission withdrawn successfully");
                fetchSubmissionHistory();
            }
        } catch (error: any) {
            toast.error("Error withdrawing submission: " + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (sub: any) => {
        setIteration(String(sub.assessmentId));
        setEditingSubmissionId(sub.submissionId);
        toast("Please select a new file to update", { icon: 'ℹ️' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                const response = await api.get(`/api/Submission/active-iterations`);
                // Check if response.data is the array or ApiResponse object
                if (Array.isArray(response.data)) {
                    setAssessments(response.data);
                } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
                    setAssessments(response.data.data);
                }
            } catch (error: any) {
                if (error.response?.status !== 401) {
                    toast.error("Failed to load assessments list");
                }
            }
        };

        const fetchProjectInfo = async () => {
            try {
                const response = await api.get(`/api/Project/my-project`);
                if (response.data.success) {
                    setProjectInfo({
                        projectId: response.data.data.projectId,
                        title: response.data.data.title
                    });
                }
            } catch (error) {
                console.error("Failed to fetch project info:", error);
            }
        };

        const fetchTemplates = async () => {
            try {
                const response = await api.get('/api/ProjectTemplate/active');
                if (response.data.success) {
                    setTemplates(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch templates:", error);
            }
        };

        const fetchActiveSemester = async () => {
            try {
                const response = await api.get('/api/Semester/active');
                if (response.data && response.data.data) {
                    setActiveSemester({
                        id: response.data.data.semesterId,
                        name: response.data.data.semesterName
                    });
                }
            } catch (error) {
                console.error("Failed to fetch active semester:", error);
            }
        };

        if (hasGroup) {
            fetchAssessments();
            fetchProjectInfo();
            fetchSubmissionHistory();
            fetchTemplates();
            fetchActiveSemester();
        }
    }, [hasGroup]);
    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            <Toaster position="top-right" />

            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#0f172a]">Progress Reports</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-gray-500 capitalize">{format(currentDate, 'eeee, dd/MM/yyyy', { locale: enUS })}</p>

                        {activeSemester && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded-md">
                                    Semester: {activeSemester.name}
                                </span>
                            </>
                        )}

                        {projectInfo && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span className="text-primary font-bold text-sm bg-blue-50 px-2 py-0.5 rounded-md">
                                    Project: {projectInfo.title}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                {hasGroup && (
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-primary/10 p-2 rounded-full text-primary"><User size={18} /></div>
                        <div className="text-sm">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Current Student</p>
                            <p className="font-bold text-gray-700">{userStatus.studentName} ({userStatus.mssv})</p>
                        </div>
                    </div>
                )}
            </header>

            {groupLoading ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-gray-500 font-medium font-display">Loading group information...</p>
                </div>
            ) : !hasGroup ? (
                <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 text-center space-y-6">
                    <div className="bg-amber-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-amber-600">
                        <AlertCircle size={48} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-gray-900">Submission Locked</h3>
                        <p className="text-gray-500 max-w-md mx-auto">Either you are not in a group or haven't been assigned a project yet. Please check your group status.</p>
                    </div>
                    <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all" onClick={() => window.location.href = '/student/group'}>Go to Group Management</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Noti Deadline */}
                        {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-4">*/}
                        {/*    {deadlines.map(dl => (*/}
                        {/*        <div key={dl.id} className="bg-white p-4 rounded-2xl border-l-4 border-l-rose-500 shadow-sm flex items-center gap-4">*/}
                        {/*            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl animate-pulse"><BellRing size={24} /></div>*/}
                        {/*            <div>*/}
                        {/*                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-[9px]">Sắp hết hạn</p>*/}
                        {/*                <p className="font-bold text-gray-800 text-sm">{dl.title}</p>*/}
                        {/*                <p className="text-rose-600 text-[10px] font-medium mt-1 italic">Còn {formatDistanceToNow(dl.date, { locale: vi })}</p>*/}
                        {/*            </div>*/}
                        {/*        </div>*/}
                        {/*    ))}*/}
                        {/*</div>*/}

                        {/* 2. FORM Submit report */}
                        <section className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 relative overflow-hidden">
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wide">
                                        Project Milestones / Iterations
                                    </label>
                                    {editingSubmissionId && (
                                        <button
                                            onClick={resetForm}
                                            className="text-xs text-rose-500 font-bold flex items-center gap-1 hover:underline"
                                        >
                                            <X size={14} /> Cancel edit
                                        </button>
                                    )}
                                </div>
                                <select
                                    value={iteration}
                                    onChange={(e) => setIteration(e.target.value)}
                                    disabled={loading}
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">-- Select Iteration --</option>
                                    {assessments.map((item) => {
                                        const isPastDeadline = item.deadline && new Date() > new Date(item.deadline);
                                        return (
                                            <option
                                                key={item.assessmentId}
                                                value={item.assessmentId}
                                                disabled={!!isPastDeadline}
                                            >
                                                {item.title}
                                                {item.deadline ? ` - Deadline: ${format(new Date(item.deadline), 'dd/MM/yyyy')}` : ''}
                                                {isPastDeadline ? " (Overdue)" : ""}
                                            </option>
                                        );
                                    })}
                                </select>

                                {/* Display requirement description */}
                                {iteration && (
                                    <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                        {assessments.find(a => String(a.assessmentId) === String(iteration))?.description ? (
                                            <p className="text-xs text-gray-600 italic">
                                                <span className="font-bold text-blue-700">Requirement:</span> {
                                                    assessments.find(a => String(a.assessmentId) === String(iteration))?.description
                                                }
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No detailed description for this iteration.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div {...getRootProps()} className={`border-2 border-dashed rounded-3xl p-14 text-center transition-all cursor-pointer mb-8 ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
                                <input {...getInputProps()} />
                                <CloudUpload size={64} className="mx-auto text-gray-300 mb-4" />
                                {selectedFile ? (
                                    <div className="text-primary font-bold">
                                        <p className="text-lg">{selectedFile.name}</p>
                                        <p className="text-xs opacity-60 font-normal">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm font-medium italic">Drag & drop compressed file (.zip, .rar) here to submit</p>
                                )}
                            </div>

                            {loading && (
                                <div className="mb-6 space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-primary italic">
                                        <span>Uploading to Drive...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-primary h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`w-full py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 ${editingSubmissionId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-primary hover:bg-blue-700 shadow-blue-100'} text-white`}
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : (editingSubmissionId ? <Edit3 size={20} /> : <SendHorizontal size={20} />)}
                                {loading ? `UPLOADING (${uploadProgress}%)` : (editingSubmissionId ? 'UPDATE SUBMISSION' : 'CONFIRM SUBMISSION')}
                            </button>
                        </section>

                        {/* 3. SUBMISSION HISTORY */}
                        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <History size={20} className="text-gray-400" />
                                <h3 className="text-lg font-bold text-[#1e293b]">Group Submission History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-[10px] text-gray-400 uppercase border-b border-gray-100 font-black tracking-widest">
                                        <tr>
                                            <th className="pb-3 px-2 text-center">Milestone</th>
                                            <th className="pb-3">File Info</th>
                                            <th className="pb-3 text-center">Submitted By</th>
                                            <th className="pb-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {submissionHistory.map((sub) => (
                                            <tr key={sub.submissionId} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="py-4 px-2">
                                                    <div className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded text-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        {sub.assessmentTitle}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <a href={sub.reportUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-900 hover:text-primary transition-colors flex items-center gap-2">
                                                        {sub.fileName}
                                                        <Download size={12} className="opacity-0 group-hover:opacity-100" />
                                                    </a>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                                                            <Clock size={10} /> {sub.submittedAt ? format(new Date(sub.submittedAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                                                        </span>
                                                        <span className="text-[10px] text-primary font-bold italic">{sub.groupName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600 mb-1">{sub.submitterName?.charAt(0) || 'U'}</div>
                                                        <span className="text-[10px] font-medium text-gray-600">{sub.submitterName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(sub)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit submission"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleWithdraw(sub.submissionId)}
                                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="Withdraw submission"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {submissionHistory.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="py-10 text-center text-gray-400 italic text-sm">No submissions found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: TEMPLATES & RULES */}
                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 border-t-4 border-t-emerald-500">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg font-bold italic"><Download size={20} /></div>
                                <h3 className="text-lg font-bold text-gray-900">Download Templates</h3>
                            </div>
                            <div className="space-y-3">
                                {templates.length > 0 ? (
                                    templates.map(tmp => (
                                        <a
                                            key={tmp.templateId}
                                            href={tmp.templateUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-between p-3 rounded-2xl border border-gray-50 hover:border-emerald-200 hover:bg-emerald-50 transition-all font-display"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-[9px] font-black bg-emerald-100 px-2 py-1 rounded text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-all uppercase">
                                                    {tmp.templateName.split('.').pop()?.toUpperCase() || 'FILE'}
                                                </div>
                                                <p className="text-[11px] font-bold text-gray-700">{tmp.templateName}</p>
                                            </div>
                                            <Download size={14} className="text-gray-300 group-hover:text-emerald-600" />
                                        </a>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic text-center py-4 font-display">No templates found.</p>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-4 italic text-center">* Please submit your report using the provided templates.</p>
                        </section>

                        <section className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                                <Info size={20} className="text-primary" /> Submission Notes
                            </h3>
                            <ul className="space-y-4 text-[11px] text-slate-400 leading-relaxed">
                                <li className="flex gap-2">
                                    <span className="text-primary font-bold underline">01</span>
                                    <span>The system automatically links submissions to your group's <b>Project ID</b>.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold underline">02</span>
                                        <span>Only <b>Compressed Files (.zip, .rar)</b> are accepted.</span>
                                    </li>
                                <li className="flex gap-2">
                                    <span className="text-primary font-bold underline">03</span>
                                    <span>Only the last submission before the deadline is counted as official.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-primary font-bold underline">04</span>
                                    <span>Files are uploaded directly to Admin Google Drive with unlimited storage.</span>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressReports;