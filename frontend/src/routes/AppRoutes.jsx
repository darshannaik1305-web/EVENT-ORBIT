import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { ROLES } from '@/config/roles'

// Layouts
import AuthLayout from '@/layouts/AuthLayout'
import StudentLayout from '@/layouts/StudentLayout'
import AdminLayout from '@/layouts/AdminLayout'
import SuperAdminLayout from '@/layouts/SuperAdminLayout'

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
import StudentProfile from '@/pages/Student/Profile'
import StudentMyEvents from '@/pages/Student/MyEvents'
import StudentSettings from '@/pages/Student/Settings'

// Pages - Admin
import AdminDashboard from '@/pages/Admin/Dashboard'
import AdminEvents from '@/pages/Admin/Events'
import AdminParticipants from '@/pages/Admin/Participants'
import AdminResults from '@/pages/Admin/Results'

// Pages - SuperAdmin
import SuperAdminDashboard from '@/pages/SuperAdmin/Dashboard'
import SuperAdminClubs from '@/pages/SuperAdmin/Clubs'
import SuperAdminUsers from '@/pages/SuperAdmin/Users'
import SuperAdminRequests from '@/pages/SuperAdmin/Requests'

// Fallback
import NotFound from '@/pages/NotFound'
import Unauthorized from '@/pages/Unauthorized'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      </Route>

      {/* Protected Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.USER]} />}>
        <Route element={<StudentLayout />}>
          <Route path={ROUTES.STUDENT.HOME} element={<StudentHome />} />
          <Route path={ROUTES.STUDENT.EVENTS} element={<StudentEvents />} />
          <Route path={ROUTES.STUDENT.CLUBS} element={<StudentClubs />} />
          <Route path={ROUTES.STUDENT.PROFILE} element={<StudentProfile />} />
          <Route path={ROUTES.STUDENT.MY_EVENTS} element={<StudentMyEvents />} />
          <Route path={ROUTES.STUDENT.SETTINGS} element={<StudentSettings />} />
        </Route>
      </Route>

      {/* Protected Club Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.CLUB_ADMIN]} />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN.EVENTS} element={<AdminEvents />} />
          <Route path={ROUTES.ADMIN.PARTICIPANTS} element={<AdminParticipants />} />
          <Route path={ROUTES.ADMIN.RESULTS} element={<AdminResults />} />
        </Route>
      </Route>

      {/* Protected Super Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<SuperAdminLayout />}>
          <Route path={ROUTES.SUPERADMIN.DASHBOARD} element={<SuperAdminDashboard />} />
          <Route path={ROUTES.SUPERADMIN.CLUBS} element={<SuperAdminClubs />} />
          <Route path={ROUTES.SUPERADMIN.USERS} element={<SuperAdminUsers />} />
          <Route path={ROUTES.SUPERADMIN.REQUESTS} element={<SuperAdminRequests />} />
        </Route>
      </Route>

      {/* Fallbacks */}
      <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
    </Routes>
  )
}
