import { ROUTES } from '@/config/routes'

export const redirectByRole = (role) => {
  switch (role?.toUpperCase()) {
    case 'USER':
    case 'STUDENT':
    case 'CLUB_ADMIN':
      return ROUTES.STUDENT.HOME
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return ROUTES.SUPERADMIN.DASHBOARD
    default:
      return ROUTES.LOGIN
  }
}
export default redirectByRole
