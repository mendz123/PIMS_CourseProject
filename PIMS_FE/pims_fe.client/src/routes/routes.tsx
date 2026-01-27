import { createBrowserRouter } from "react-router-dom";
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
// Placeholder components - sẽ tạo sau
const Dashboard = () => <div>Dashboard Page</div>;
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
        path: "dashboard",
        element: <Dashboard />,
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
        path: "student/dashboard",
        element: <StudentDashboard />,
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
        path: "/assign-teacher",
        element: <AssignTeacherPage />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
