// ...Other imports
import { useRoutes } from "react-router-dom";
import routes from "tempo-routes";

    // Tempo routes
    {import.meta.env.VITE_TEMPO && useRoutes(routes)}
    <Routes>
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
    </Routes>
import { useEffect } from "react";
import Login from "./components/Login";
import SuperAdminPanel from "./components/SuperAdminPanel";
import CompanyAdminPanel from "./components/CompanyAdminPanel";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { initializeUsers } from "./utils/auth";
import './index.css';

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate panel based on role
    if (user.role === "superadmin") {
      return <Navigate to="/super-admin" />;
    } else if (user.role === "admin") {
      return <Navigate to="/company-admin" />;
    }
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  useEffect(() => {
    // Include required font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // Initialize default super admin if not exists
    initializeUsers();

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen font-inter">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/super-admin/*" 
                element={
                  <ProtectedRoute allowedRoles={["superadmin"]}>
                    <SuperAdminPanel />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/company-admin/*" 
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <CompanyAdminPanel />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
} 


export default App;
