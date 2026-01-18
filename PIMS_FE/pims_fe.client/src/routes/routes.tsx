import { createBrowserRouter } from "react-router-dom";
import { Login, Home } from "../pages/Home";
import AssignTeacherPage from "../pages/AssignTeacherPage";

// Placeholder components - sẽ tạo sau
const Dashboard = () => <div>Dashboard Page</div>;
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
  },
]);

export default router;
