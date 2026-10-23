import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { UserRole } from './types';

// Layouts
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { PrivacyPolicyPage, TermsOfServicePage } from './pages/public/LegalPages';
import { VerificationPortal } from './pages/public/VerificationPortal';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AccessDenied } from './pages/auth/AccessDenied';

// Applicant Pages
import { ApplicantDashboard } from './pages/applicant/ApplicantDashboard';
import { ApplicationWizard } from './pages/applicant/ApplicationWizard';
import { ApplicationDetailPage } from './pages/applicant/ApplicationDetail';

// Reviewer Pages
import { ReviewerDashboard } from './pages/reviewer/ReviewerDashboard';
import { ReviewerDetailPage } from './pages/reviewer/ReviewerDetail';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagement';
import { RuleManagementPage } from './pages/admin/RuleManagement';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

// Public Layout Wrapper
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Route Guard
const ProtectedRoute: React.FC<{ allowedRoles?: UserRole[] }> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <DashboardLayout />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Marketing Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/verify" element={<VerificationPortal />} />
                  <Route path="/verify/:reportCode" element={<VerificationPortal />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* Applicant Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['APPLICANT', 'ADMIN', 'REVIEWER']} />}>
              <Route path="/applicant" element={<ApplicantDashboard />} />
              <Route path="/applicant/applications" element={<ApplicantDashboard />} />
              <Route path="/applicant/applications/:id" element={<ApplicationDetailPage />} />
              <Route path="/applicant/wizard" element={<ApplicationWizard />} />
            </Route>

            {/* Reviewer Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['REVIEWER', 'ADMIN']} />}>
              <Route path="/reviewer" element={<ReviewerDashboard />} />
              <Route path="/reviewer/applications" element={<ReviewerDashboard />} />
              <Route path="/reviewer/applications/:id" element={<ReviewerDetailPage />} />
              <Route path="/compliance-rules" element={<RuleManagementPage />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/rules" element={<RuleManagementPage />} />
              <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </NotificationProvider>
  </AuthProvider>
</ThemeProvider>
  );
};

export default App;
