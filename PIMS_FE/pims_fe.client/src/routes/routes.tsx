import { createBrowserRouter } from "react-router-dom";
import { Login, Home } from "../pages/Home";

// Placeholder components - sẽ tạo sau
const Dashboard = () => <div>Dashboard Page</div>;
const AdminDashboard = () => (
  <div>Admin Dashboard - Manage Users, Classes, etc.</div>
);
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
    path: "/admin/dashboard",
    element: <AdminDashboard />,
  },
  {
    path: "/teacher/dashboard",
    element: <TeacherDashboard />,
  },
  {
    path: "/student/dashboard",
    element: <StudentDashboard />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
