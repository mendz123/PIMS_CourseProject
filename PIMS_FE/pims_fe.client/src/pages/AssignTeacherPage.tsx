import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';

interface UserInfo {
    userId: number;
    email: string;
    fullName: string | null;
    role: string | null;
}

interface ClassDto {
    classId: number;
    classCode: string;
    semester: string | null;
    subject: string | null;
    teacherName: string | null;
    teacherId: number | null;
}

interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
}

const AssignTeacherPage: React.FC = () => {
    const [classes, setClasses] = useState<ClassDto[]>([]);
    const [teachers, setTeachers] = useState<UserInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch classes
            const classesRes = await api.get<ApiResponse<ClassDto[]>>('/api/class');
            if (classesRes.data.success) {
                setClasses(classesRes.data.data);
            }

            // Fetch teachers
            const teachersRes = await api.get<ApiResponse<UserInfo[]>>('/api/user/teachers');
            if (teachersRes.data.success) {
                setTeachers(teachersRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage('Failed to load data. Please ensure you are logged in as Admin/Subject Head.');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignTeacher = async (classId: number, teacherId: number) => {
        try {
            if (!teacherId) return;

            const payload = {
                classId: classId,
                teacherId: teacherId
            };

            const response = await api.put<ApiResponse<any>>('/api/class/assign-teacher', payload);

            if (response.data.success) {
                setMessage('Teacher assigned successfully!');
                // Refresh list
                fetchData();
            } else {
                setMessage(`Error: ${response.data.message}`);
            }
        } catch (error: any) {
            console.error('Error assigning teacher:', error);
            const errorMsg = error.response?.data?.message || 'Failed to assign teacher';
            setMessage(errorMsg);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />

            <main className="pt-28 pb-12 px-6">
                <div className="max-w-[1200px] mx-auto min-h-[60vh]">
                    {/* Header Section */}
                    <div className="mb-10 text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">
                            Admin Portal
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
                            Assign Teachers
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Manage class assignments efficiently. Assign qualified teachers to classes for upcoming semesters.
                        </p>
                    </div>

                    {message && (
                        <div className={`p-4 mb-8 rounded-2xl border ${message.includes('Success') || message.includes('successfully') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} flex items-center gap-3 shadow-sm`}>
                            <span className="material-symbols-outlined">
                                {message.includes('Success') || message.includes('successfully') ? 'check_circle' : 'error'}
                            </span>
                            <span className="font-medium">{message}</span>
                        </div>
                    )}

                    {/* Content Card */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Class Code
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Semester
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Current Teacher
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[250px]">
                                            Assign
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {classes.map((cls) => (
                                        <tr key={cls.classId} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-100">
                                                        {cls.classCode.substring(0, 2)}
                                                    </div>
                                                    <span className="font-semibold text-slate-700">
                                                        {cls.classCode}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600">
                                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-medium text-slate-600">
                                                    {cls.semester || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600">
                                                {cls.subject || (
                                                    <span className="text-slate-400 italic">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                {cls.teacherName ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                                                            {cls.teacherName.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {cls.teacherName}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="relative group">
                                                    <select
                                                        className="appearance-none w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block px-4 py-2.5 pr-10 transition-all hover:border-slate-300 cursor-pointer shadow-sm"
                                                        defaultValue={cls.teacherId || ''}
                                                        onChange={(e) => handleAssignTeacher(cls.classId, Number(e.target.value))}
                                                    >
                                                        <option value="" disabled>Select Teacher</option>
                                                        {teachers.map((teacher) => (
                                                            <option key={teacher.userId} value={teacher.userId}>
                                                                {teacher.fullName} ({teacher.email})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 group-hover:text-slate-600 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                            <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {classes.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-20">
                                                <div className="flex flex-col items-center gap-4 text-slate-400">
                                                    <div className="p-4 rounded-full bg-slate-50">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-lg font-medium text-slate-500">No classes found</p>
                                                    <p className="text-sm">There are currently no classes available for assignment.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AssignTeacherPage;
