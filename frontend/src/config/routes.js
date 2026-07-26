export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  STUDENT: {
    HOME: '/',
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
