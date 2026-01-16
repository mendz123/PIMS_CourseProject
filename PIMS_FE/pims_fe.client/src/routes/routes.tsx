import { createBrowserRouter } from "react-router-dom";
import { Login, Home } from "../pages";

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
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
