import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { ROLES } from '@/config/roles'

// Layouts
import AuthLayout from '@/layouts/AuthLayout'
import StudentLayout from '@/layouts/StudentLayout'
import AdminLayout from '@/layouts/AdminLayout'
import SuperAdminLayout from '@/layouts/SuperAdminLayout'
import LandingLayout from '@/components/landing/LandingLayout'

// Pages
import LandingPage from '@/pages/Landing'

// Guards
import ProtectedRoute from './ProtectedRoute'

// Pages - Auth
import Login from '@/pages/Auth/Login'
import Register from '@/pages/Auth/Register'
import ForgotPassword from '@/pages/Auth/ForgotPassword'

// Pages - Student
import StudentHome from '@/pages/Student/Home'
import StudentEvents from '@/pages/Student/Events'
import StudentClubs from '@/pages/Student/Clubs'
import ClubDetails from '@/pages/Student/ClubDetails'
import StudentProfile from '@/pages/Student/Profile'
import StudentMyEvents from '@/pages/Student/MyEvents'
import StudentResults from '@/pages/Student/Results'
import AIAssistant from '@/pages/Student/AIAssistant'
import StudentSettings from '@/pages/Student/Settings'

// Pages - Admin
import AdminEvents from '@/pages/Admin/Events'
import AdminParticipants from '@/pages/Admin/Participants'
import AdminResults from '@/pages/Admin/Results'

// Pages - SuperAdmin
import SuperAdminDashboard from '@/pages/SuperAdmin/Dashboard'
import SuperAdminClubs from '@/pages/SuperAdmin/Clubs'
import SuperAdminUsers from '@/pages/SuperAdmin/Users'

// Fallback
import NotFound from '@/pages/NotFound'
import Unauthorized from '@/pages/Unauthorized'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route element={<LandingLayout />}>
        <Route path={ROUTES.LANDING} element={<LandingPage />} />
      </Route>

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      </Route>

      {/* Protected Student Routes (Shared by STUDENT and CLUB_ADMIN) */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.USER, ROLES.STUDENT, ROLES.CLUB_ADMIN]} />}>
        <Route element={<StudentLayout />}>
          <Route path={ROUTES.STUDENT.HOME} element={<StudentHome />} />
          <Route path={ROUTES.STUDENT.EVENTS} element={<StudentEvents />} />
          <Route path={ROUTES.STUDENT.CLUBS} element={<StudentClubs />} />
          <Route path={ROUTES.STUDENT.CLUB_DETAILS} element={<ClubDetails />} />
          <Route path={ROUTES.STUDENT.MY_EVENTS} element={<StudentMyEvents />} />
          <Route path={ROUTES.STUDENT.RESULTS} element={<StudentResults />} />
          <Route path={ROUTES.STUDENT.AI_ASSISTANT} element={<AIAssistant />} />
          <Route path={ROUTES.STUDENT.PROFILE} element={<StudentProfile />} />
          <Route path={ROUTES.STUDENT.SETTINGS} element={<StudentSettings />} />
        </Route>
      </Route>

      {/* Protected Club Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.CLUB_ADMIN]} />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<Navigate to={ROUTES.ADMIN.EVENTS} replace />} />
          <Route path={ROUTES.ADMIN.EVENTS} element={<AdminEvents />} />
          <Route path={ROUTES.ADMIN.PARTICIPANTS} element={<AdminParticipants />} />
          <Route path={ROUTES.ADMIN.RESULTS} element={<AdminResults />} />
        </Route>
      </Route>

      {/* Protected Super Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} />}>
        <Route element={<SuperAdminLayout />}>
          <Route path={ROUTES.SUPERADMIN.DASHBOARD} element={<SuperAdminDashboard />} />
          <Route path={ROUTES.SUPERADMIN.CLUBS} element={<SuperAdminClubs />} />
          <Route path={ROUTES.SUPERADMIN.USERS} element={<SuperAdminUsers />} />
        </Route>
      </Route>

      {/* Fallbacks */}
      <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
    </Routes>
  )
}
