import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
    pages: {
        signIn: '/login',
        newUser: '/registro',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
            const isOnAuth = nextUrl.pathname.startsWith('/login') ||
                nextUrl.pathname.startsWith('/registro')

            if (isOnDashboard) {
                if (isLoggedIn) return true
                return false // Redireciona para /login
            } else if (isLoggedIn && isOnAuth) {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }

            return true
        },
    },
    providers: [], // Configurado em auth.ts
} satisfies NextAuthConfig