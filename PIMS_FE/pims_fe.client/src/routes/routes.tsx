import { createBrowserRouter } from "react-router-dom";
import { Login, Home } from "../pages/Home";
import AssignTeacherPage from "../pages/AssignTeacherPage";
import AdminDashboard from "../pages/Admin/Dashboard";
import RouterWrapper from "../components/RouterWrapper";

// Placeholder components - sẽ tạo sau
const Dashboard = () => <div>Dashboard Page</div>;
// AdminDashboard is now imported
const TeacherDashboard = () => (
  <div>Teacher Dashboard - Manage Courses, Grades, etc.</div>
);
const StudentDashboard = () => (
  <div>Student Dashboard - View Courses, Grades, etc.</div>
);
const NotFound = () => <div>404 - Page Not Found</div>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/assign-teacher",
    element: <AssignTeacherPage />,
  },
  {
    path: "*",
    element: <NotFound />,
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
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
