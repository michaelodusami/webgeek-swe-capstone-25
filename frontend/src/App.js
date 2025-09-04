import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LoginPage from './pages/LoginPage';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardStudent from './pages/DashboardStudent';
import AdminSettings from './pages/AdminSettings';
import UsersSettings from './pages/settings/UsersSettings';
import SemestersSettings from './pages/settings/SemestersSettings';
import CoursesSettings from './pages/settings/CoursesSettings';
import ProjectsSettings from './pages/settings/ProjectsSettings';
import SkillsSettings from './pages/settings/SkillsSettings';

import MatchingSettings from './pages/settings/MatchingSettings';
import SystemSettings from './pages/settings/SystemSettings';
import { AuthContext } from './context/AuthContext';
import { ROLE_STUDENT, ROLE_ADMIN, ROLE_STAFF, ROLE_FACULTY } from './utils/roles';
import { 
  ROUTE_HOME, 
  ROUTE_DASHBOARD_STUDENT, 
  ROUTE_DASHBOARD_ADMIN, 
  ROUTE_ADMIN_SETTINGS,
  ROUTE_ADMIN_SETTINGS_USERS,
  ROUTE_ADMIN_SETTINGS_SEMESTERS,
  ROUTE_ADMIN_SETTINGS_COURSES,
  ROUTE_ADMIN_SETTINGS_PROJECTS,
  ROUTE_ADMIN_SETTINGS_SKILLS,

  ROUTE_ADMIN_SETTINGS_MATCHING,
  ROUTE_ADMIN_SETTINGS_SYSTEM
} from './utils/routes';

// Create theme with Poppins font
const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    h2: {
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    h3: {
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    h4: {
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    h5: {
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    h6: {
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    body1: {
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    body2: {
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    button: {
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
  },
});

function getDashboardPath(role) {
  switch (role) {
    case ROLE_STUDENT:
      return ROUTE_DASHBOARD_STUDENT;
    case ROLE_ADMIN:
    case ROLE_STAFF:
    case ROLE_FACULTY:
      return ROUTE_DASHBOARD_ADMIN;
    default:
      return ROUTE_HOME;
  }
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }
  if (!user) {
    return <Navigate to={ROUTE_HOME} replace />;
  }
  const userRole = user.edupersonprimaryaffiliation?.toLowerCase();
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to={getDashboardPath(userRole)} replace />;
  }
  return children;
}

function App() {
  const { user, loading } = useContext(AuthContext);
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route
            path={ROUTE_HOME}
            element={
              loading ? (
                <div>Loading...</div>
              ) : user ? (
                <Navigate to={getDashboardPath(user.edupersonprimaryaffiliation?.toLowerCase())} replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path={ROUTE_DASHBOARD_ADMIN}
            element={
              <ProtectedRoute allowedRoles={[ROLE_ADMIN, ROLE_STAFF, ROLE_FACULTY]}>
                <DashboardAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_ADMIN_SETTINGS}
            element={
              <ProtectedRoute allowedRoles={[ROLE_ADMIN, ROLE_STAFF, ROLE_FACULTY]}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_ADMIN_SETTINGS_USERS}
            element={
              <ProtectedRoute allowedRoles={[ROLE_ADMIN, ROLE_STAFF, ROLE_FACULTY]}>
                <UsersSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_ADMIN_SETTINGS_SEMESTERS}
            element={
              <ProtectedRoute allowedRoles={[ROLE_ADMIN, ROLE_STAFF, ROLE_FACULTY]}>
                <SemestersSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_ADMIN_SETTINGS_COURSES}
            element={
              <ProtectedRoute allowedRoles={[ROLE_ADMIN, ROLE_STAFF, ROLE_FACULTY]}>
                <CoursesSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_ADMIN_SETTINGS_PROJECTS}
            element={
              <ProtectedRoute allowedRoles={[ROLE_ADMIN, ROLE_STAFF, ROLE_FACULTY]}>
                <ProjectsSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_ADMIN_SETTINGS_SKILLS}
            element={
              <ProtectedRoute allowedRoles={[ROLE_ADMIN, ROLE_STAFF, ROLE_FACULTY]}>
                <SkillsSettings />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTE_ADMIN_SETTINGS_MATCHING}
            element={
              <ProtectedRoute allowedRoles={[ROLE_ADMIN, ROLE_STAFF, ROLE_FACULTY]}>
                <MatchingSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_ADMIN_SETTINGS_SYSTEM}
            element={
              <ProtectedRoute allowedRoles={[ROLE_ADMIN, ROLE_STAFF, ROLE_FACULTY]}>
                <SystemSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTE_DASHBOARD_STUDENT}
            element={
              <ProtectedRoute allowedRoles={[ROLE_STUDENT]}>
                <DashboardStudent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;