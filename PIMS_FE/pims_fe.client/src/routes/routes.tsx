import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login, Home } from "../pages/Home";
import AdminDashboard from "../pages/Admin/Dashboard";
import { StudentDashboard } from "../pages/Student";
import { TeacherDashboard } from "../pages/Teacher";
import {
  SubjectHeadDashboard,
  AssessmentManagement,
} from "../pages/SubjectHead";
import RouterWrapper from "../components/RouterWrapper";
import AssignTeacherPage from "../pages/AssignTeacherPage";
import StudentGroup from "../pages/Student/StudentGroup";
// Import Layout mới của bạn
import MainLayout from "../components/student/MainLayout";
import ProgressReports from "../pages/Student/ProgressReports";

const NotFound = () => <div>404 - Page Not Found</div>;

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RouterWrapper />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: "login",
                element: <Login />,
            },

            // --- NHÓM ROUTE CHO SINH VIÊN (Dùng chung Layout) ---
            {
                path: "student",
                element: <MainLayout />, // Sidebar và Header nằm ở đây
                children: [
                    {
                        path: "dashboard",
                        element: <StudentDashboard />,
                    },
                    {
                        path: "group",
                        element: <StudentGroup />,
                    },
                    {
                        path: "reports",
                        element: <ProgressReports />, // Trang nộp báo cáo bạn vừa sửa
                    },
                ],
            },

            // --- CÁC ROUTE KHÁC (Admin, Teacher...) ---
            {
                path: "admin/dashboard",
                element: <AdminDashboard />,
            },
            {
                path: "teacher/dashboard",
                element: <TeacherDashboard />,
            },
            {
                path: "subject-head/dashboard",
                element: <SubjectHeadDashboard />,
            },
            {
                path: "assign-teacher",
                element: <AssignTeacherPage />,
            },
            {
                path: "*",
                element: <NotFound />,
            },
        ],
    },
]);