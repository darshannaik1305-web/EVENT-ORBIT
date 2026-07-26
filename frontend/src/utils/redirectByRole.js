import { ROUTES } from '@/config/routes'

export const redirectByRole = (role) => {
  switch (role?.toUpperCase()) {
    case 'USER':
      return ROUTES.STUDENT.HOME
    case 'CLUB_ADMIN':
      return ROUTES.ADMIN.DASHBOARD
    case 'ADMIN':
      return ROUTES.SUPERADMIN.DASHBOARD
    default:
      return ROUTES.LOGIN
  }
}
export default redirectByRole
