import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login, Home } from "../pages/Home";
import AdminDashboard from "../pages/Admin/Dashboard";
import { StudentDashboard } from "../pages/Student";
import { TeacherDashboard, GradingPage } from "../pages/Teacher";
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
import Notifications from "../pages/Student/Notifications";

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
            {
                path: "student",
                element: <MainLayout />,
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
                        element: <ProgressReports />,
                    },
                    {
                        path: "notifications",
                        element: <Notifications />,
                    },
                ],
            },
            {
                path: "admin/dashboard",
                element: <AdminDashboard />,
            },
            {
                path: "teacher/dashboard",
                element: <TeacherDashboard />,
            },
            {
                path: "teacher/grading",
                element: <GradingPage />,
            },
            {
                path: "subject-head/dashboard",
                element: <SubjectHeadDashboard />,
            },
            {
                path: "subject-head/assessments",
                element: <AssessmentManagement />,
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
