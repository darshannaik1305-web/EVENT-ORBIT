export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  UNAUTHORIZED: '/unauthorized',
  STUDENT: {
    HOME: '/dashboard',
    EVENTS: '/events',
    CLUBS: '/clubs',
    PROFILE: '/profile',
    MY_EVENTS: '/my-events',
    SETTINGS: '/settings',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    EVENTS: '/admin/events',
    PARTICIPANTS: '/admin/participants',
    RESULTS: '/admin/results',
  },
  SUPERADMIN: {
    DASHBOARD: '/superadmin',
    CLUBS: '/superadmin/clubs',
    USERS: '/superadmin/users',
    REQUESTS: '/superadmin/requests',
  },
  NOT_FOUND: '*',
}
