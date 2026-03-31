import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/repurpose/:path*',
    '/voice/:path*',
    '/inbox/:path*',
    '/reputation/:path*',
    '/challenges/:path*',
    '/avatar/:path*',
    '/analytics/:path*',
    '/employees/:path*',
    '/campaigns/:path*',
    '/company/:path*',
    '/accounts/:path*',
    '/settings/:path*',
  ],
}
