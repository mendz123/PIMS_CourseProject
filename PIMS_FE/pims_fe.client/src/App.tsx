import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { NavigationProvider } from "./context/NavigationContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <NavigationProvider>
          <RouterProvider router={router} />
        </NavigationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
