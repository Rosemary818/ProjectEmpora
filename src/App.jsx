import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import Register from './pages/Register/Register'
import Login from './pages/Login/Login'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import VerifyOTP from './pages/VerifyOTP/VerifyOTP'
import ResetPassword from './pages/ResetPassword/ResetPassword'
import ChangePassword from './pages/ChangePassword/ChangePassword'
import EmployeeDashboard from './pages/EmployeeDashboard/EmployeeDashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard/SuperAdminDashboard'
import HRAdminDashboard from './pages/HRAdminDashboard/HRAdminDashboard'
import ManagerDashboard from './pages/ManagerDashboard/ManagerDashboard'
import CareerPortalDashboard from './pages/CareerPortalDashboard/CareerPortalDashboard'
import ServiceExecutiveDashboard from './pages/ServiceExecutiveDashboard/ServiceExecutiveDashboard'
import CandidateRegister from './pages/CandidateRegister/CandidateRegister'
import ActivityTimeline from './pages/ActivityTimeline/ActivityTimeline'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/candidate-register" element={<CandidateRegister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />

        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute allowedRoles={['HRAdmin']}>
              <HRAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/activity"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <ManagerDashboard defaultTab="Activity Timeline" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/activity"
          element={
            <ProtectedRoute allowedRoles={['Employee']}>
              <EmployeeDashboard defaultTab="Activity Timeline" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/career-portal/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Candidate']}>
              <CareerPortalDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/service-executive/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ServiceExecutive']}>
              <ServiceExecutiveDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
