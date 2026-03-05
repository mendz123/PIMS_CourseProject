import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login, Home } from "../pages/Home";
import AdminDashboard from "../pages/Admin/Dashboard";
import { GroupProvider } from "../context/GroupContext";
import { StudentDashboard } from "../pages/Student";
import {
  TeacherDashboard,
  GradingPage,
  GroupListPage,
  TeacherNotifications,
  TeacherDefenseSchedulePage,
} from "../pages/Teacher";
import {
  SubjectHeadDashboard,
  AssessmentManagement,
} from "../pages/SubjectHead";
import RouterWrapper from "../components/RouterWrapper";
import AssignTeacherPage from "../pages/AssignTeacherPage";
import StudentGroup from "../pages/Student/StudentGroup";
import SettingsPage from "../pages/Student/SettingsPage";
import TeacherSettingsPage from "../pages/Teacher/TeacherSettingsPage";
import MainLayout from "../components/student/MainLayout";
import ProgressReports from "../pages/Student/ProgressReports";
import Notifications from "../pages/Student/Notifications";
import NotFound from "../pages/NotFound";
import AssessmentPage from "../pages/Student/AssessmentPage";

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
            index: true,
            element: <Navigate to="/student/group" replace />,
          },
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
          {
            path: "assessment",
            element: <AssessmentPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
        ],
      },
      {
        path: "admin/dashboard",
        element: (
          <GroupProvider>
            <AdminDashboard />
          </GroupProvider>
        ),
      },
      {
        path: "teacher",
        element: <Navigate to="/teacher/dashboard" replace />,
      },
      {
        path: "teacher/dashboard",
        element: <TeacherDashboard />,
      },
      {
        path: "teacher/groups",
        element: <GroupListPage />,
      },
      {
        path: "teacher/grading",
        element: <GradingPage />,
      },
      {
        path: "teacher/notifications",
        element: <TeacherNotifications />,
      },
      {
        path: "teacher/defense-schedule",
        element: <TeacherDefenseSchedulePage />,
      },
      {
        path: "teacher/settings",
        element: <TeacherSettingsPage />,
      },
      {
        path: "subject-head",
        element: (
          <GroupProvider>
            <RouterWrapper />
          </GroupProvider>
        ),
        children: [
          {
            path: "dashboard",
            element: <SubjectHeadDashboard />,
          },
          {
            path: "assessments",
            element: <AssessmentManagement />,
          },
        ],
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
