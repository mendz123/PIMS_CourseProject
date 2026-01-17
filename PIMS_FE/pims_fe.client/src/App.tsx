import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { NavigationProvider } from "./context/NavigationContext";

function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <RouterProvider router={router} />
      </NavigationProvider>
    </AuthProvider>
  );
}

export default App;
